FROM node:20-bookworm-slim AS common

FROM common AS project
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
FROM common AS web-deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install protobuf-compiler ca-certificates openssl libssl-dev libpq-dev libxml2 -y

FROM web-deps AS web-builder

COPY --from=project /app /app
WORKDIR /app

RUN pnpm install --frozen-lockfile && \
    pnpm exec buf generate && \
    pnpm --filter=web build && \
    pnpm deploy --filter=web /web && \
    mv /app/packages/client/web/dist /web/dist

### SERVICE BINARY
FROM rust:slim-bookworm AS service-deps

RUN apt-get update && apt-get install build-essential protobuf-compiler openssl pkg-config libssl-dev libpq-dev -y

FROM service-deps AS service-builder

COPY --from=project /app /usr/src/retrom
RUN cargo install --path /usr/src/retrom/packages/service --features embedded_db

### RUNTIME
FROM web-deps AS runner

# Generic env
ENV RUST_LOG=info
ENV PUID=1000
ENV PGID=1000
ENV UMASK=002
ENV TZ=Etc/UTC
# Service env
ENV RETROM_CONFIG=/app/config/config.json
ENV PORT=5101
ENV RETROM_WEB_PORT=3000
ENV EMBEDDED_DB_OPTS="?data_dir=/app/data/db&password_file=/app/data/pgpass.conf&installation_dir=/app/psql"
# Web env
ENV NODE_ENV=production

RUN adduser retrom
RUN usermod -o -u ${PUID} retrom
RUN groupmod -o -g ${PGID} retrom

COPY --from=service-builder /usr/local/cargo/bin/retrom-service /app/retrom-service
COPY --from=web-builder /web /app/web
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/start.sh /app/start.sh

RUN mkdir -p /app/data/db && \
    mkdir /app/psql && \
    mkdir /app/config

VOLUME ["/app/config", "/app/data", "/app/psql"]

RUN chown -R retrom:retrom /app && \
    chmod -R "=rwx" /app && \
    chmod +x /app/start.sh

EXPOSE ${RETROM_SERVER_PORT}
EXPOSE ${PORT}

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
CMD ["/app/start.sh"]
