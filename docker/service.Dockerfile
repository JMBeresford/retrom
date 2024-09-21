FROM rust:slim-bookworm as builder

WORKDIR /usr/src/retrom
COPY . .

RUN apt-get update && apt-get install protobuf-compiler openssl pkg-config libssl-dev libpq-dev -y
RUN cargo install --path ./packages/service

FROM debian:bookworm-slim
RUN apt-get update && apt-get install openssl libssl-dev libpq-dev ca-certificates -y && rm -rf /var/lib/apt/lists/*

ENV UID=1001
ENV GID=1001
ENV RUST_LOG=info

RUN addgroup --system --gid $GID retrom
RUN adduser --system --uid $UID retrom

COPY --from=builder  /usr/local/cargo/bin/retrom-service /app/retrom-service
COPY --from=builder  /usr/src/retrom/packages/service/default_config.json /app/default_config.json

WORKDIR /app
USER retrom

ENV RETROM_CONFIG=/config/config.json

CMD ["./retrom-service"]
