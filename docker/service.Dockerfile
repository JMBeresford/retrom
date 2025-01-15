FROM node:20-bookworm-slim AS common

COPY ./packages/. /app/packages
COPY ./plugins/. /app/plugins
COPY  ./Cargo.lock \
      ./Cargo.toml \
      ./package.json \
      ./buf.gen.yaml \
      ./buf.yaml \
      ./pnpm-lock.yaml \
      ./pnpm-workspace.yaml \
      ./tsconfig.json \
      /app/

### WEB CLIENT
FROM common AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install protobuf-compiler ca-certificates openssl libssl-dev libpq-dev libxml2 -y

FROM base AS web-builder

WORKDIR /app

RUN pnpm install --frozen-lockfile && \
    pnpm exec buf generate && \
    pnpm --filter=web build && \
    pnpm deploy --filter=web /web && \
    mv /app/packages/client/web/dist /web/dist

### SERVICE BINARY
FROM rust:slim-bookworm AS service-deps

COPY --from=common /app /usr/src/retrom
RUN apt-get update && apt-get install build-essential protobuf-compiler openssl pkg-config libssl-dev libpq-dev -y

FROM service-deps AS service-builder

RUN cargo install --path /usr/src/retrom/packages/service --features embedded_db

### RUNTIME
FROM base AS runner
ENV UID=1505
ENV GID=1505
ENV UMASK=000
ENV USER=retrom
ENV RETROM_PORT=5101
ENV RETROM_WEB_PORT=3000

RUN addgroup --gid $GID ${USER}
RUN adduser --gid $GID --uid $UID ${USER}

### Service env
ENV RUST_LOG=info
ENV RETROM_CONFIG=/app/config/config.json
EXPOSE ${RETROM_PORT}

### Web env
ENV NODE_ENV=production
EXPOSE ${RETROM_WEB_PORT}

COPY --from=service-builder /usr/local/cargo/bin/retrom-service /app/retrom-service
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

COPY --from=web-builder /web /app/web

RUN mkdir /app/data
RUN mkdir /app/psql
RUN mkdir /app/config

VOLUME /app/config
VOLUME /app/data

RUN umask ${UMASK}

ENV EMBEDDED_DB_OPTS="?data_dir=/app/data&password_file=/app/.passwd&installation_dir=/app/psql"

COPY docker/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["/app/start.sh"]
