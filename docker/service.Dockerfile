### WEB CLIENT
FROM node:bookworm-slim AS web-base

FROM web-base AS deps
RUN apt-get update && apt-get install protobuf-compiler ca-certificates -y
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

FROM rust:slim-bookworm as service-builder

WORKDIR /usr/src/retrom
COPY . .

RUN apt-get update && apt-get install protobuf-compiler openssl pkg-config libssl-dev libpq-dev -y
RUN cargo install --path ./packages/service

FROM web-base
RUN apt-get update && apt-get install openssl libssl-dev libpq-dev ca-certificates -y && rm -rf /var/lib/apt/lists/*

ENV UID=1505
ENV GID=1505

RUN addgroup --gid $GID retrom
RUN adduser --gid $GID --uid $UID retrom

### Service env
ENV RUST_LOG=info
ENV RETROM_CONFIG=/config/config.json
EXPOSE 5101

### Web env
ENV NODE_ENV=production
ENV RETROM_LOCAL_SERVICE_HOST=http://localhost:5101
EXPOSE 3000 

COPY --from=service-builder  /usr/local/cargo/bin/retrom-service /app/retrom-service
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

WORKDIR /app/www
COPY --from=deps --chown=retrom:node /app/. ./

RUN corepack enable pnpm && pnpm --filter web build
RUN chmod -R 755 /app/www
RUN chown -R retrom:node /app/www

WORKDIR /app

USER retrom

CMD ["sh", "-c", "/app/start.sh"]
