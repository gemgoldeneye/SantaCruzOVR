# syntax=docker/dockerfile:1
#
# SantaCruzOVR (e-OVR) — PRODUCTION/STAGING image (Next.js standalone).
#
# Unlike the upstream OVR demo, this app is SELF-CONTAINED: its API routes live
# in `app/api/*` and talk DIRECTLY to managed Postgres (Prisma via @gelabs/ovr)
# and Redis. There is no separate Fastify service. The Prisma client is generated
# at build time; migrate + seed run once from deploy/<env>/remote-deploy.sh.
#
# The PWA service worker is emitted only by the production build (`next build
# --webpack`); see next.config.ts.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps: install all dependencies (npm, lockfile is package-lock.json) ----
FROM base AS deps
COPY package.json package-lock.json ./
# @gelabs/* is a PRIVATE scope on registry.npmjs.org — npm ci 404s without auth.
# The token is passed as a BuildKit secret (never written to an image layer or
# cache): we materialise a temporary .npmrc for the install, then it's gone.
RUN --mount=type=secret,id=npm_token \
    sh -c 'if [ -f /run/secrets/npm_token ]; then \
             printf "//registry.npmjs.org/:_authToken=%s\n" "$(cat /run/secrets/npm_token)" > .npmrc; \
           fi; \
           npm ci; rm -f .npmrc'

# ---- build: generate the Prisma client, then compile the Next app ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client (schema ships inside @gelabs/ovr). Required before `next build`.
RUN npm run db:generate
RUN npm run build

# ---- runner: slim standalone image that serves the app ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4300
ENV HOSTNAME=0.0.0.0

# Next standalone server + static assets + public files (incl. generated sw.js).
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 4300
CMD ["node", "server.js"]
