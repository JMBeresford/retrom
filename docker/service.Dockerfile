FROM node:20-bookworm-slim AS common

COPY . ./app

### WEB CLIENT
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS web-builder
RUN apt-get update && apt-get install protobuf-compiler ca-certificates -y

COPY --from=common /app /app
WORKDIR /app

RUN pnpm install --frozen-lockfile
RUN pnpm exec buf generate
RUN pnpm --filter=web build
RUN pnpm deploy --filter=web /web
RUN mv /app/packages/client/web/dist /web/dist

### SERVICE BINARY
FROM rust:slim-bookworm AS service-builder

COPY --from=common /app /usr/src/retrom
WORKDIR /usr/src/retrom

RUN apt-get update && apt-get install protobuf-compiler openssl pkg-config libssl-dev libpq-dev -y
RUN cargo install --path ./packages/service

FROM base AS runner
ENV UID=1505
ENV GID=1505
ENV USER=retrom

RUN addgroup --gid $GID ${USER}
RUN adduser --gid $GID --uid $UID ${USER}

RUN apt-get update && apt-get install openssl libssl-dev libpq-dev ca-certificates -y

### Service env
ENV RUST_LOG=info
ENV RETROM_CONFIG=/config/config.json
EXPOSE 5101

### Web env
ENV NODE_ENV=production
ENV RETROM_LOCAL_SERVICE_HOST=http://localhost:5101
EXPOSE 3000 

COPY --from=service-builder /usr/local/cargo/bin/retrom-service /app/retrom-service
COPY --chown=${USER}:${USER} docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

COPY --from=web-builder --chown=${USER}:${USER} /web /app/web

WORKDIR /app

USER ${USER}

CMD ./start.sh
