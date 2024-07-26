FROM rust:slim-bookworm as builder

WORKDIR /usr/src/retrom
COPY . .

RUN apt-get update && apt-get install protobuf-compiler openssl pkg-config libssl-dev libpq-dev -y
RUN cargo install --path ./packages/service

FROM debian:bookworm-slim
RUN apt-get update && apt-get install openssl libssl-dev libpq-dev ca-certificates -y && rm -rf /var/lib/apt/lists/*

ENV DATABASE_URL=postgres://postgres:password@localhost/retrom
ENV RETROM_PORT=5101
ENV IGDB_CLIENT_SECRET=foo
ENV IGDB_CLIENT_ID=bar
ENV CONTENT_DIR=/app/library
ENV UID=1001
ENV GID=1001
ENV RUST_LOG=info

RUN addgroup --system --gid $GID retrom
RUN adduser --system --uid $UID retrom
RUN mkdir -p /app/library && chown -R retrom:retrom /app

COPY --from=builder --chown=retrom:retrom /usr/local/cargo/bin/retrom-service /app/retrom-service

WORKDIR /app

USER retrom

CMD ["./retrom-service"]
