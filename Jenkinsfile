// Jenkins pipeline — SantaCruzOVR (e-OVR) — PRODUCTION / STAGING deploy to the VPS.
//
// Jenkins owns config: secrets are credentials, non-secrets are derived from the
// GIT BRANCH (see environment{}). The repo is rsynced to the VPS; secrets+params
// stream over SSH stdin to deploy/<env>/remote-deploy.sh, which WRITES
// deploy/<env>/.env (mode 600) and rolls the Swarm stack. Secrets never hit argv
// or the build log.
//
// This app is SELF-CONTAINED: its API routes (app/api/*) talk directly to managed
// Postgres (Prisma) + Redis — no separate api service, no PUBLIC_API_URL build arg.
//
// Branch -> env: `staging` branch deploys staging; anything else (main) -> prod.
//
// Required Jenkins credentials (Secret text):
//   stcz-ovr-database-url · stcz-ovr-redis-url · stcz-ovr-session-secret
// SSH: zambal-vps-ssh (SSH username with private key).

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 40, unit: 'MINUTES')
  }

  parameters {
    string(name: 'API_REPLICAS', defaultValue: '', description: 'Override API replicas (blank = env default).')
    string(name: 'WEB_REPLICAS', defaultValue: '', description: 'Override web replicas (blank = env default).')
  }

  environment {
    TAG      = "${env.GIT_COMMIT?.take(8) ?: env.BUILD_NUMBER}"
    SSH_CRED = 'zambal-vps-ssh'
    SSH_OPTS = '-o StrictHostKeyChecking=accept-new'

    // Branch → environment: `staging` branch -> staging, else (main) -> prod.
    DEPLOY_ENV = "${(env.BRANCH_NAME ?: env.GIT_BRANCH ?: '').contains('staging') ? 'staging' : 'prod'}"

    STACK      = "${DEPLOY_ENV == 'staging' ? 'stcz-ovr-staging' : 'stcz-ovr'}"
    ENV_DIR    = "${DEPLOY_ENV == 'staging' ? 'deploy/staging' : 'deploy/prod'}"
    DEPLOY_DIR = "${DEPLOY_ENV == 'staging' ? '/opt/zambal-staging/SantaCruzOVR' : '/opt/zambal/SantaCruzOVR'}"
    VPS_HOST   = "${DEPLOY_ENV == 'staging' ? '172.237.78.70' : '172.237.78.70'}"
    VPS_USER   = 'deploy'
    DOMAIN     = "${DEPLOY_ENV == 'staging' ? 'glstest.site' : 'glstest.site'}"
  }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Sync to VPS') {
      steps {
        sshagent(credentials: [env.SSH_CRED]) {
          sh '''
            set -eu
            ssh ${SSH_OPTS} ${VPS_USER}@${VPS_HOST} "mkdir -p ${DEPLOY_DIR}"
            rsync -az --delete \
              --exclude '.git' --exclude '**/node_modules' \
              --exclude '**/dist' --exclude '**/.next*' --exclude '**/.env' \
              -e "ssh ${SSH_OPTS}" \
              ./ ${VPS_USER}@${VPS_HOST}:${DEPLOY_DIR}/
          '''
        }
      }
    }

    stage('Build + migrate + rolling deploy') {
      steps {
        withCredentials([
          string(credentialsId: 'stcz-ovr-database-url',  variable: 'OVR_DATABASE_URL'),
          string(credentialsId: 'stcz-ovr-redis-url',     variable: 'OVR_REDIS_URL'),
          string(credentialsId: 'stcz-ovr-session-secret',variable: 'OVR_SESSION_SECRET'),
          // npm token for the private @gelabs/* scope on registry.npmjs.org.
          // npm ci can't see private packages unauthenticated (npm returns 404),
          // so this is required to build. Forwarded to docker build as a SECRET.
          string(credentialsId: 'gelabs-npm-token',       variable: 'GELABS_NPM_TOKEN')
          // OPTIONAL — direct (non-PgBouncer) OWNER url for migrations only, to
          // avoid the advisory-lock timeout (P1002) that PgBouncer's :6432 pool
          // causes. Same owner role, but port 5432 straight to Postgres. Once you
          // create the `stcz-ovr-direct-database-url` credential, UNCOMMENT the
          // next line and the matching `export` below. Until then, remote-deploy
          // falls back to the pooled OVR_DATABASE_URL automatically.
           // ,string(credentialsId: 'stcz-ovr-direct-database-url', variable: 'OVR_DIRECT_DATABASE_URL')
        ]) {
          sshagent(credentials: [env.SSH_CRED]) {
            sh '''
              set -eu
              : "${API_REPLICAS:=}"   # params may be blank/unset — default to empty
              : "${WEB_REPLICAS:=}"   # so `set -u` below doesn't abort on them
              ssh ${SSH_OPTS} ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_DIR} && bash -s" <<EOF
set -eu
export TAG='${TAG}'
export DOMAIN='${DOMAIN}'
export STACK='${STACK}'
export ENV_DIR='${ENV_DIR}'
export OVR_DATABASE_URL='${OVR_DATABASE_URL}'
export OVR_REDIS_URL='${OVR_REDIS_URL}'
export OVR_SESSION_SECRET='${OVR_SESSION_SECRET}'
export GELABS_NPM_TOKEN='${GELABS_NPM_TOKEN}'
# Uncomment together with the credential binding above once it exists:
# export OVR_DIRECT_DATABASE_URL='${OVR_DIRECT_DATABASE_URL}'
export API_REPLICAS='${API_REPLICAS}'
export WEB_REPLICAS='${WEB_REPLICAS}'
exec bash ${ENV_DIR}/remote-deploy.sh
EOF
            '''
          }
        }
      }
    }

    stage('Smoke (public edge)') {
      steps {
        sh '''
          set -eu
          host="ovr-stacruz-staging.${DOMAIN}"
          [ "${DEPLOY_ENV}" = "prod" ] && host="ovr.stacruz.${DOMAIN}"
          probe() {
            url="$1"
            for i in $(seq 1 30); do
              # -L: follow redirects so a healthy app that 307s (e.g. / -> /login)
              # reports its FINAL status. Accept any 2xx/3xx as up; only 000 (no
              # response), 4xx, and 5xx are treated as not-ready.
              code=$(curl -fsSL -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
              case "$code" in 2*|3*) echo "OK  $url ($code)"; return 0 ;; esac
              echo "  ($i/30) $url -> ${code:-no-response}, retrying..."; sleep 3
            done
            echo "FAIL $url"; return 1
          }
          probe "https://${host}/api/healthz"
          probe "https://${host}/"
        '''
      }
    }
  }

  post {
    failure { echo "SantaCruzOVR ${DEPLOY_ENV} deploy FAILED — Swarm rolls back changed services." }
    success { echo "SantaCruzOVR ${TAG} live (${DEPLOY_ENV})" }
  }
}
