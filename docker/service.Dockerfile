FROM rust:slim-bookworm as builder

WORKDIR /usr/src/retrom
COPY . .

RUN apt-get update && apt-get install protobuf-compiler openssl pkg-config libssl-dev libpq-dev -y
RUN cargo install --path ./packages/service

FROM debian:bookworm-slim
RUN apt-get update && apt-get install openssl libpq5 -y && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/cargo/bin/retrom-service /usr/local/bin/retrom-service

ENV DATABASE_URL=postgres://postgres:password@localhost/retrom
ENV RETROM_PORT=5051
ENV IGDB_CLIENT_SECRET=foo
ENV IGDB_CLIENT_ID=bar

CMD ["retrom-service"]
