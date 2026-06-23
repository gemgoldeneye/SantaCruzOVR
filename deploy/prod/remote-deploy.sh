#!/usr/bin/env bash
# Runs ON THE VPS. Builds the SantaCruzOVR image, migrates + seeds the managed DB
# once, renders the edge config, and rolls the stcz-ovr stack. Jenkins owns all
# config: it binds each secret from its credential store and passes them (plus
# non-secret params) as ENV VARS over SSH. THIS SCRIPT writes deploy/prod/.env
# from those vars — no secret is committed, nobody hand-places .env.
#
# The app is self-contained (API routes in app/api/* hit Postgres+Redis directly),
# so there is NO separate api service and NO PUBLIC_API_URL build arg. Required env:
#
#   TAG DOMAIN                                  (params)
#   OVR_DATABASE_URL OVR_REDIS_URL OVR_SESSION_SECRET   (credentials)
#   API_REPLICAS WEB_REPLICAS                   (params, optional)
#
# Expects docker + `docker swarm init` on the VPS.
set -euo pipefail

: "${TAG:?set TAG}"
: "${DOMAIN:?set DOMAIN}"
STACK="${STACK:-stcz-ovr}"
ENV_DIR="${ENV_DIR:-deploy/prod}"

cd "$(dirname "$0")/../.."          # repo root
echo "==> deploying SantaCruzOVR $TAG to stack $STACK (env dir: $ENV_DIR)"

: "${OVR_DATABASE_URL:?Jenkins must pass OVR_DATABASE_URL (credential)}"
: "${OVR_REDIS_URL:?Jenkins must pass OVR_REDIS_URL (credential)}"
: "${OVR_SESSION_SECRET:?Jenkins must pass OVR_SESSION_SECRET (credential)}"

umask 077
cat > "$ENV_DIR/.env" <<EOF
OVR_DATABASE_URL=${OVR_DATABASE_URL}
OVR_REDIS_URL=${OVR_REDIS_URL}
OVR_SESSION_SECRET=${OVR_SESSION_SECRET}
API_REPLICAS=${API_REPLICAS:-2}
WEB_REPLICAS=${WEB_REPLICAS:-2}
EOF
echo "==> wrote $ENV_DIR/.env (mode 600)"
set -a; . "$ENV_DIR/.env"; set +a

# Build the standalone app image (Prisma client generated inside the build).
docker build -f Dockerfile --target runner -t "stcz-ovr-app:$TAG" .

# Migrate every deploy (idempotent; prisma skips applied migrations).
docker run --rm \
  -e DATABASE_URL="$OVR_DATABASE_URL" -e TZ=Asia/Manila \
  "stcz-ovr-app:$TAG" npm run db:deploy

# Seed ONCE, ever (initial setup only). The OVR seed is idempotent, but we still
# gate it so it runs a single time and adds no work to later deploys. Guard: a
# marker row in `_seed_meta`, checked/written via psql from a throwaway postgres
# container (no psql needed on the VPS).
seed_once() {
  local marker="$1"; shift            # remaining args = the seed command
  local q_check q_mark
  q_check="CREATE TABLE IF NOT EXISTS _seed_meta (marker text PRIMARY KEY, seeded_at timestamptz NOT NULL DEFAULT now()); \
           SELECT 1 FROM _seed_meta WHERE marker = '$marker';"
  if docker run --rm -e PGURL="$OVR_DATABASE_URL" postgres:16-alpine \
       sh -c 'psql "$PGURL" -tAc "'"$q_check"'"' 2>/dev/null | grep -q 1; then
    echo "==> seed '$marker' already applied — skipping"
    return 0
  fi
  echo "==> seeding '$marker' (first time)"
  # Run the seed but DON'T let a failure abort the deploy outright. If it fails
  # only because the data is already present (a DB seeded BEFORE this marker
  # existed → unique/duplicate-key 23505), treat it as already-seeded: record
  # the marker and continue. Any OTHER failure is a real error and aborts.
  local out rc
  set +e
  out="$("$@" 2>&1)"; rc=$?
  set -e
  printf '%s\n' "$out"
  if [ "$rc" -ne 0 ]; then
    if printf '%s' "$out" | grep -qiE 'duplicate key|already exists|code: .?23505|unique constraint'; then
      echo "==> seed '$marker' hit duplicate data — already seeded; recording marker and continuing"
    else
      echo "!! seed '$marker' failed (exit $rc) for a non-duplicate reason — aborting" >&2
      return "$rc"
    fi
  fi
  q_mark="INSERT INTO _seed_meta (marker) VALUES ('$marker') ON CONFLICT DO NOTHING;"
  docker run --rm -e PGURL="$OVR_DATABASE_URL" postgres:16-alpine \
    sh -c 'psql "$PGURL" -c "'"$q_mark"'"' >/dev/null
  echo "==> recorded seed marker '$marker'"
}
seed_once "initial" docker run --rm \
  -e DATABASE_URL="$OVR_DATABASE_URL" -e TZ=Asia/Manila \
  "stcz-ovr-app:$TAG" npm run db:seed

# Render DOMAIN into the edge config (idempotent: regenerate from .tmpl).
if [ ! -f "$ENV_DIR/nginx.conf.tmpl" ]; then
  cp "$ENV_DIR/nginx.conf" "$ENV_DIR/nginx.conf.tmpl"
fi
sed "s/DOMAIN/$DOMAIN/g" "$ENV_DIR/nginx.conf.tmpl" > "$ENV_DIR/nginx.conf"

# Rolling deploy.
export TAG
docker stack deploy -c "$ENV_DIR/compose.yml" "$STACK"

echo "==> waiting for services to converge"
deadline=$(( SECONDS + 300 ))
while :; do
  pending=0
  while read -r name replicas _; do
    [ "$name" = "NAME" ] && continue
    [ "${replicas%%/*}" = "${replicas##*/}" ] || { pending=1; echo "  $name: $replicas"; }
  done < <(docker stack services "$STACK")
  [ "$pending" -eq 0 ] && { echo "==> converged"; break; }
  [ "$SECONDS" -ge "$deadline" ] && { echo "!! timeout"; docker stack services "$STACK"; exit 1; }
  sleep 5
done
