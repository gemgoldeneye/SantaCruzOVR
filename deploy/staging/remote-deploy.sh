#!/usr/bin/env bash
# Runs ON THE STAGING VPS. Builds the SantaCruzOVR image, migrates + seeds the
# managed DB once, and rolls the stcz-ovr-staging stack. Jenkins passes every
# value as an ENV VAR (secrets from credentials, the rest from params); this
# script writes deploy/staging/.env (mode 600) — nobody hand-places it.
#
# The app is self-contained (API routes in app/api/* hit Postgres+Redis directly),
# so there is NO separate api service and NO PUBLIC_API_URL build arg. Required env:
#
#   TAG DOMAIN (e.g. glstest.site)
#   OVR_DATABASE_URL OVR_REDIS_URL OVR_SESSION_SECRET
#   [API_REPLICAS WEB_REPLICAS]
set -euo pipefail

: "${TAG:?set TAG}"
: "${DOMAIN:?set DOMAIN (e.g. glstest.site)}"
STACK="${STACK:-stcz-ovr-staging}"
ENV_DIR="${ENV_DIR:-deploy/staging}"

cd "$(dirname "$0")/../.."          # repo root
echo "==> deploying SantaCruzOVR $TAG to stack $STACK (env dir: $ENV_DIR)"

: "${OVR_DATABASE_URL:?Jenkins must pass OVR_DATABASE_URL (credential)}"
: "${OVR_REDIS_URL:?Jenkins must pass OVR_REDIS_URL (credential)}"
: "${OVR_SESSION_SECRET:?Jenkins must pass OVR_SESSION_SECRET (credential)}"

umask 077
# Single-quote every value: this file is SOURCED below, so values with
# shell-special chars (@ # & = in DB passwords) must not be word-split or
# executed. A literal single-quote inside a value is escaped as '\''.
sq() { printf "%s" "$1" | sed "s/'/'\\\\''/g"; }
cat > "$ENV_DIR/.env" <<EOF
OVR_DATABASE_URL='$(sq "${OVR_DATABASE_URL}")'
OVR_REDIS_URL='$(sq "${OVR_REDIS_URL}")'
OVR_SESSION_SECRET='$(sq "${OVR_SESSION_SECRET}")'
API_REPLICAS=${API_REPLICAS:-1}
WEB_REPLICAS=${WEB_REPLICAS:-1}
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
  "$@"
  q_mark="INSERT INTO _seed_meta (marker) VALUES ('$marker') ON CONFLICT DO NOTHING;"
  docker run --rm -e PGURL="$OVR_DATABASE_URL" postgres:16-alpine \
    sh -c 'psql "$PGURL" -c "'"$q_mark"'"' >/dev/null
  echo "==> recorded seed marker '$marker'"
}
seed_once "initial" docker run --rm \
  -e DATABASE_URL="$OVR_DATABASE_URL" -e TZ=Asia/Manila \
  "stcz-ovr-app:$TAG" npm run db:seed

# (Edge moved out) — the SHARED edge (deploy/edge/edge-up.sh) owns :80/:443 and
# TLS for the whole host. This stack ships no nginx; nothing to render here.

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
