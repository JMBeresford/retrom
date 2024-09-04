FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat protobuf-dev
WORKDIR /app

# top level deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# package deps
RUN mkdir -p packages/client/ && mkdir -p packages/codegen/
COPY buf*.yaml ./
COPY packages/codegen/protos/ ./packages/codegen/protos/
COPY packages/client/package.json ./packages/client/
COPY packages/client/web/ ./packages/client/web/

RUN corepack enable pnpm && pnpm i

RUN pnpm exec buf generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/. ./

RUN corepack enable pnpm && pnpm --filter web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV UID=1001
ENV GID=1001
ENV PORT=3000
ENV RETROM_PORT=5101
ENV RETROM_HOSTNAME=http://localhost
ENV RETROM_HOST=http://localhost:5101

RUN addgroup --system --gid $GID retrom
RUN adduser --system --uid $UID retrom


COPY --from=builder --chown=retrom:retrom /app/packages/client/web/dist ./dist

USER retrom

EXPOSE $PORT

CMD npx vite preview --host --port $PORT
