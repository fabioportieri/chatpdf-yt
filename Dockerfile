FROM node:18-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Omit --production flag for TypeScript devDependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  # Allow install without lockfile, so example works even without Node.js installed locally
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

COPY src ./src
COPY public ./public
COPY next.config.js .
COPY tsconfig.json .
COPY tailwind.config.ts postcss.config.js ./
COPY drizzle.config.ts  ./ 
COPY config-overrides.js ./ 

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG OPENAI_KEY
ENV OPENAI_KEY=${OPENAI_KEY}

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

ARG KEYCLOAK_SECRET
ENV KEYCLOAK_SECRET=${KEYCLOAK_SECRET}

ARG KEYCLOAK_ISSUER
ENV KEYCLOAK_ISSUER=${KEYCLOAK_ISSUER}

ARG KEYCLOAK_ID
ENV KEYCLOAK_ID=${KEYCLOAK_ID}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG CHROMA_API_IMPL
ENV CHROMA_API_IMPL=${CHROMA_API_IMPL}

ARG CHROMA_SERVER_HOST
ENV CHROMA_SERVER_HOST=${CHROMA_SERVER_HOST}

ARG CHROMA_SERVER_HTTP_PORT
ENV CHROMA_SERVER_HTTP_PORT=${CHROMA_SERVER_HTTP_PORT}

ARG NUTPROJECT_ACCESS_TOKEN_PLAIN
ENV NUTPROJECT_ACCESS_TOKEN_PLAIN=${NUTPROJECT_ACCESS_TOKEN_PLAIN}

ARG NUTPROJECT_ACCESS_TOKEN_SECRET
ENV NUTPROJECT_ACCESS_TOKEN_SECRET=${NUTPROJECT_ACCESS_TOKEN_SECRET}

ARG NUTPROJECT_ACCESS_TOKEN_IV
ENV NUTPROJECT_ACCESS_TOKEN_IV=${NUTPROJECT_ACCESS_TOKEN_IV}

ARG MINIO_ENDPOINT
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}

ARG MINIO_PORT
ENV MINIO_PORT=${MINIO_PORT}

ARG MINIO_USESSL
ENV MINIO_USESSL=${MINIO_USESSL}

ARG MINIO_ACCESSKEY
ENV MINIO_ACCESSKEY=${MINIO_ACCESSKEY}

ARG MINIO_SECRETKEY
ENV MINIO_SECRETKEY=${MINIO_SECRETKEY}

ARG MINIO_BUCKET_NAME
ENV MINIO_BUCKET_NAME=${MINIO_BUCKET_NAME}

ARG PORT
ENV PORT=${PORT}

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else yarn build; \
  fi

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public


# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


# Environment variables must be redefined at run time

ARG OPENAI_KEY
ENV OPENAI_KEY=${OPENAI_KEY}

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

ARG KEYCLOAK_SECRET
ENV KEYCLOAK_SECRET=${KEYCLOAK_SECRET}

ARG KEYCLOAK_ISSUER
ENV KEYCLOAK_ISSUER=${KEYCLOAK_ISSUER}

ARG KEYCLOAK_ID
ENV KEYCLOAK_ID=${KEYCLOAK_ID}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG CHROMA_API_IMPL
ENV CHROMA_API_IMPL=${CHROMA_API_IMPL}

ARG CHROMA_SERVER_HOST
ENV CHROMA_SERVER_HOST=${CHROMA_SERVER_HOST}

ARG CHROMA_SERVER_HTTP_PORT
ENV CHROMA_SERVER_HTTP_PORT=${CHROMA_SERVER_HTTP_PORT}

ARG NUTPROJECT_ACCESS_TOKEN_PLAIN
ENV NUTPROJECT_ACCESS_TOKEN_PLAIN=${NUTPROJECT_ACCESS_TOKEN_PLAIN}

ARG NUTPROJECT_ACCESS_TOKEN_SECRET
ENV NUTPROJECT_ACCESS_TOKEN_SECRET=${NUTPROJECT_ACCESS_TOKEN_SECRET}

ARG NUTPROJECT_ACCESS_TOKEN_IV
ENV NUTPROJECT_ACCESS_TOKEN_IV=${NUTPROJECT_ACCESS_TOKEN_IV}

ARG MINIO_ENDPOINT
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}

ARG MINIO_PORT
ENV MINIO_PORT=${MINIO_PORT}

ARG MINIO_USESSL
ENV MINIO_USESSL=${MINIO_USESSL}

ARG MINIO_ACCESSKEY
ENV MINIO_ACCESSKEY=${MINIO_ACCESSKEY}

ARG MINIO_SECRETKEY
ENV MINIO_SECRETKEY=${MINIO_SECRETKEY}

ARG MINIO_BUCKET_NAME
ENV MINIO_BUCKET_NAME=${MINIO_BUCKET_NAME}

ARG PORT
ENV PORT=${PORT}

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

CMD ["node", "server.js"]
