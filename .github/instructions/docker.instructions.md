# Docker Instructions

## Overview

Docker support for running the service in containers. Configuration in `docker/` directory.

## Directory Structure

```plaintext
docker/
├── docker-compose.yml      # Docker Compose configuration
├── service.Dockerfile      # Dockerfile for the service
├── entrypoint.sh           # Container entrypoint
├── start.sh                # Service startup script
├── build.sh                # Build helper script
├── .env                    # Environment variables (not committed)
├── config_dev/             # Development configuration
├── mock_content/           # Mock content for testing
├── mock_content_custom/    # Custom mock content
└── mock_content_single/    # Single item mock content
```

## Docker Compose

### Services Defined

- **Database** (PostgreSQL) - Application database with persistent volume
- **Service** - Backend service (gRPC + REST)

### Running

```bash
cd docker

# Start all services
docker-compose up

# Start detached
docker-compose up -d

# Build and start
docker-compose up --build

# Stop
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f service
```

## Service Dockerfile

Multi-stage build:

1. **Builder** - Compiles Rust code
2. **Runtime** - Minimal image with binary

### Building

```bash
# From repo root
docker build -f docker/service.Dockerfile -t retrom-service .

# From docker directory
cd docker && docker build -f service.Dockerfile -t retrom-service ..
```

### Running

```bash
docker run -p 5101:5101 -p 5102:5102 \
  -e DATABASE_URL=postgres://user:pass@host/db \
  retrom-service
```

## Environment Variables

**Database**:

- `DATABASE_URL` - PostgreSQL connection string
- Or: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

**Service**:

- `GRPC_PORT` - gRPC port (default: 5101)
- `REST_PORT` - REST API port (default: 5102)
- `RUST_LOG` - Log level (`error`, `warn`, `info`, `debug`, `trace`)

**Telemetry**:

- `OTEL_EXPORTER_OTLP_ENDPOINT` - OpenTelemetry endpoint
- `OTEL_SERVICE_NAME` - Service name for tracing

## Development Workflow

### Database Only

```bash
cd docker
docker-compose up -d db

# Run service locally
cd .. && pnpm nx cargo:run service
```

### Full Docker

```bash
cd docker
docker-compose up --build

# Rebuild specific service
docker-compose up --build service
```

## Mock Content

Test data available in `docker/` directory:

- `mock_content/` - Standard mock data
- `mock_content_custom/` - Custom scenarios
- `mock_content_single/` - Minimal test data

Mount as volumes or copy into containers for testing.

## Scripts

**`entrypoint.sh`** - Container entrypoint:

- Waits for database readiness
- Runs migrations
- Starts service
- Handles graceful shutdown

**`start.sh`** - Service startup script
**`build.sh`** - Helper for building images

## Production

### Building

```bash
docker build -f docker/service.Dockerfile \
  -t retrom-service:latest \
  -t retrom-service:v0.7.51 \
  .
```

### Running

```bash
docker run -d \
  --name retrom-service \
  -p 5101:5101 -p 5102:5102 \
  -e DATABASE_URL=$DATABASE_URL \
  -e RUST_LOG=info \
  --restart unless-stopped \
  retrom-service:v0.7.51
```

### Production Compose

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: unless-stopped
    
  service:
    image: retrom-service:v0.7.51
    depends_on:
      - db
    environment:
      DATABASE_URL: ${DATABASE_URL}
      RUST_LOG: info
    restart: unless-stopped
    
volumes:
  db-data:
```

## Health Checks

```yaml
services:
  service:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5102/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Networking

**Internal**: Services on Docker network

- Database: `db:5432`
- Service: `service:5101` (gRPC), `service:5102` (REST)

**External**: Expose ports in compose

## Troubleshooting

### Database Connection

```bash
# Check database running
docker-compose ps db

# View logs
docker-compose logs db

# Test connection
docker-compose exec service sh
```

### Build Issues

```bash
# Clean build
docker-compose build --no-cache

# Remove all and rebuild
docker-compose down --rmi all
docker-compose up --build
```

## Best Practices

**Images**:

- ✅ Multi-stage builds for size
- ✅ Specific base image versions
- ✅ Run as non-root when possible
- ✅ Leverage build caching

**Security**:

- ✅ Don't commit `.env` with secrets
- ✅ Use secrets management
- ✅ Update base images regularly
- ✅ Scan for vulnerabilities

**Development**:

- ✅ Use Docker Compose locally
- ✅ Keep dev/prod configs separate
- ✅ Use mock data

**Production**:

- ✅ Use specific version tags
- ✅ Implement health checks
- ✅ Configure resource limits
- ✅ Set up log aggregation
