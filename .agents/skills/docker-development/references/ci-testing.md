# CI Testing Patterns for Docker Images

Comprehensive patterns for testing Docker images in CI/CD pipelines.

## The Challenge

Docker images often have:

- **Entrypoint scripts** that run before any command
- **Service dependencies** (databases, caches) that don't exist in CI
- **Network configurations** referencing other containers
- **Required environment variables** that fail validation

These cause CI failures that don't occur in local development.

## Pattern 1: Entrypoint Bypass

### Problem

```dockerfile
# Dockerfile
ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
```

```yaml
# CI - FAILS
- run: docker run --rm myimage php -v
# Output: entrypoint.sh runs, starts services, php -v never executes properly
```

### Solution

```yaml
# Override entrypoint for direct command execution
- run: docker run --rm --entrypoint php myimage -v
- run: docker run --rm --entrypoint php myimage -m # List modules
- run: docker run --rm --entrypoint node myimage --version
- run: docker run --rm --entrypoint /bin/sh myimage -c "cat /etc/os-release"
```

### When to Use

- Verifying installed software versions
- Checking available extensions/modules
- Testing configuration files
- Running diagnostic commands

## Pattern 2: DNS Mocking for Upstream Services

### Problem

```nginx
# nginx.conf
upstream backend {
    server app:9000;
}
```

```yaml
# CI - FAILS
- run: docker run --rm nginx-image nginx -t
# Error: host not found in upstream "app:9000"
```

### Solution

```yaml
# Provide fake DNS resolution for upstream hosts
- run: |
    docker run --rm \
      --add-host app:127.0.0.1 \
      --add-host database:127.0.0.1 \
      --add-host cache:127.0.0.1 \
      nginx-image nginx -t
```

### Multiple Upstreams

```yaml
- name: Test nginx config
  run: |
    docker run --rm \
      --add-host php-fpm:127.0.0.1 \
      --add-host mailpit:127.0.0.1 \
      --add-host redis:127.0.0.1 \
      myapp-nginx nginx -t
```

## Pattern 3: Docker Compose Validation

### Problem

```yaml
# compose.yml
services:
  app:
    environment:
      - DB_PASSWORD=${DB_PASSWORD:?Required}
```

```yaml
# CI - FAILS
- run: docker compose config
# Error: required variable DB_PASSWORD is missing
```

### Solution

```yaml
- name: Create test environment
  run: |
    cp .env.example .env
    # Replace all CHANGE_ME placeholders
    sed -i 's/CHANGE_ME_[A-Z_]*/test_password/g' .env

- name: Validate compose syntax
  run: docker compose config > /dev/null
```

### Alternative: Inline Variables

```yaml
- name: Validate compose
  env:
    DB_PASSWORD: test
    REDIS_PASSWORD: test
  run: docker compose config > /dev/null
```

## Pattern 4: Health Check Verification

### Test Health Check Command

```yaml
- name: Build image
  run: docker build -t myapp:test .

- name: Test health check
  run: |
    # Start container
    docker run -d --name test-container myapp:test

    # Wait for health
    timeout 60 bash -c 'until docker inspect test-container --format="{{.State.Health.Status}}" | grep -q healthy; do sleep 2; done'

    # Verify
    docker inspect test-container --format="{{.State.Health.Status}}"

- name: Cleanup
  if: always()
  run: docker rm -f test-container
```

### Worker/Sidecar Services That Reuse an App Image

A compose service that reuses the app image (e.g. a queue worker on the
php-fpm+nginx web image) **inherits the image's baked-in `HEALTHCHECK`**.
Three traps, in the order they typically bite in CI:

1. **Inherited check probes a daemon the worker doesn't run** (nginx, php-fpm)
   → the worker is permanently `unhealthy` and breaks
   `docker compose up -d --wait` — and anything else gating on health.
2. **`healthcheck: { disable: true }` is not a fix when `--wait` is used** —
   compose fails with `container ... has no healthcheck configured`
   (explicitly listed services without a check are un-waitable).
   Give the worker a real check instead.
3. **A naive `pgrep -f` check is _always_ healthy** — the `CMD-SHELL`
   wrapper's own command line contains the search string, so `pgrep`
   matches the probe shell itself, even with a dead worker.

```yaml
services:
  worker:
    image: myapp:latest # inherits the web image's HEALTHCHECK
    command: php bin/console messenger:consume async
    healthcheck:
      # WRONG: matches the probe's own shell -- healthy forever
      # test: ["CMD-SHELL", "pgrep -f 'messenger:consume' || exit 1"]
      # RIGHT: [c]haracter-class guard prevents self-match
      test: ["CMD-SHELL", "pgrep -f '[m]essenger:consume' || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
```

Verify any health probe **both ways**: process up → `healthy` AND process
killed → `unhealthy`. The naive `pgrep` pattern passes the positive test
and hides the bug.

Prefer letting a worker exit on its own limits (`exec` the daemon as PID 1,
restart policy with backoff) over in-container `while true ... || true`
loops that mask fatal errors from orchestration.

## Pattern 5: Secret Scanning with Exclusions

### Problem

Documentation references placeholder passwords:

```markdown
<!-- README.md -->

Set `DB_PASSWORD=CHANGE_ME` in your .env file
```

```yaml
# CI - FALSE POSITIVE
- run: git ls-files | xargs grep -l "CHANGE_ME" && exit 1
# Fails on README.md, QUICKSTART.md, etc.
```

### Solution

```yaml
- name: Check for leaked secrets
  run: |
    # Files that legitimately reference placeholders
    EXCLUDE_PATTERN=".env.example|README|QUICKSTART|docs/|Makefile|\.github/"

    # Find files with secrets, excluding legitimate references
    FOUND=$(git ls-files | xargs grep -l "CHANGE_ME" | grep -vE "$EXCLUDE_PATTERN" || true)

    if [ -n "$FOUND" ]; then
      echo "Found secrets in:"
      echo "$FOUND"
      exit 1
    fi
    echo "No leaked secrets detected"
```

## Pattern 6: Multi-Platform Build Testing

```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3

- name: Set up Buildx
  uses: docker/setup-buildx-action@v3

- name: Build multi-platform
  uses: docker/build-push-action@v6
  with:
    platforms: linux/amd64,linux/arm64
    load: false # Can't load multi-platform
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Pattern 7: Integration Testing with Service Containers

```yaml
jobs:
  test:
    services:
      database:
        image: mariadb:11
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: testdb
        options: >-
          --health-cmd="healthcheck.sh --connect --innodb_initialized"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - name: Build app image
        run: docker build -t myapp:test .

      - name: Run integration tests
        run: |
          docker run --rm \
            --network ${{ job.container.network }} \
            -e DB_HOST=database \
            -e DB_PASSWORD=test \
            myapp:test npm test
```

## Pattern 8: GitLab CI — image entrypoint must be a shell (or be overridden)

Unlike a test-time `--entrypoint` bypass (Pattern 1), GitLab **runs every job's `script:` via `sh -c`**. If the image used as a job `image:` has a non-shell `ENTRYPOINT ["mytool"]`, the runner effectively runs `mytool sh -c '…'` → **`No such command 'sh'`**, and the job fails before the script runs.

```yaml
job:
  image:
    name: registry.example.com/mytool:1.0
    entrypoint: [""] # let the runner's shell execute the script
  script:
    - mytool --help
```

A CLI image also meant for `docker run mytool …` can keep `ENTRYPOINT ["mytool"]`, but **document** that GitLab consumers must set `entrypoint: [""]`. If the image is _primarily_ a CI image, prefer no tool entrypoint (use `CMD`).

## Pattern 9: Restricted runner egress — bundle external assets at build time

CI runners (especially internal/self-hosted) often have **no outbound internet**. An image that fetches something at _runtime_ (`page.add_script_tag(url="https://cdn…/axe.min.js")`, `curl https://…` in the entrypoint, a remote `pip`/`npm` install) works locally but fails in CI.

Download the asset at **build time** and load it from the image. Use a multi-stage build so the fetch tooling (`curl`, `ca-certificates`) stays out of the final runtime image:

```dockerfile
# Stage 1: fetch external assets
FROM alpine:3.20 AS asset-builder
RUN apk add --no-cache curl
RUN mkdir -p /opt/axe-core \
 && curl -sSfL https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js \
      -o /opt/axe-core/axe.min.js

# Stage 2: final image carries only the asset
FROM python:3.12-slim
COPY --from=asset-builder /opt/axe-core/axe.min.js /opt/axe-core/axe.min.js
ENV AXE_PATH=/opt/axe-core/axe.min.js
```

…and have the app prefer the local file (CDN as a dev-only fallback).

## Pattern 10: Test the _built image_, not just the editable dev install

A non-editable install in the image (`pip install .`, `npm install <tarball>`) does not behave like the editable/dev checkout your tests ran against. Classic failure: **data files resolved by walking from `__file__`** (`Path(__file__).resolve().parents[2]/"data"/…`) don't exist under `site-packages`, so the tool can't find its catalog/config inside the container even though `pytest` was green.

- Ship data files as **package data** (Python wheel `force-include`/`package_data`; npm `files`), not via filesystem-relative paths.
- Smoke-test the **built image**, not just the source tree:

```yaml
- run: docker build -t app:test .
- run: docker run --rm --entrypoint python app:test -c "import app; app.load_catalog()"
- run: docker run --rm app:test render fixture.json /tmp/out # real command, end-to-end
```

## Pattern 11: Bake targets must inherit `docker-metadata-action`

### Problem

When a workflow migrates from `docker/build-push-action` to
`docker/bake-action`, the tags computed by `docker/metadata-action`
(semver from release tags, branch tags, `latest`) are **silently dropped**.
There is no CI error — the registry only ever updates the tags hardcoded in
`docker-bake.hcl`, so release and branch tags go stale or missing.

`docker/metadata-action` writes a generated bake definition exposing a
`docker-metadata-action` target that carries the computed `tags`/`labels`.
A bake target only picks them up if it explicitly inherits that target.

### Solution

Declare a stub `docker-metadata-action` target with local defaults and have
the real target inherit it. In CI, the metadata-action's generated bake file
replaces the stub; locally, the defaults apply.

```hcl
# docker-bake.hcl
target "docker-metadata-action" {
  tags = ["myapp:dev"]   # local default; replaced by metadata-action in CI
}

target "app" {
  inherits  = ["docker-metadata-action"]
  platforms = ["linux/amd64", "linux/arm64"]
  # Do NOT set `tags` here: a target's own attributes override inherited
  # ones, so a local `tags` would discard the CI-computed tags.
}
```

Re-add rolling tags such as `latest`/`production` through the
metadata-action config, not the bake file:

```yaml
- uses: docker/metadata-action@v5
  with:
    images: ghcr.io/org/myapp
    tags: |
      type=raw,value=latest,enable={{is_default_branch}}
```

### Verify Both Paths

```bash
# Local: stub defaults apply
docker buildx bake --print

# CI: simulate the generated metadata file replacing the stub
docker buildx bake -f docker-bake.hcl -f /tmp/metadata-bake.json --print
```

## Complete CI Workflow Example

```yaml
name: Docker CI

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup test environment
        run: |
          cp .env.example .env
          sed -i 's/CHANGE_ME_[A-Z_]*/ci_test_value/g' .env

      - name: Validate compose
        run: docker compose config > /dev/null

  build-and-test:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - name: Build images
        run: docker compose build

      - name: Test PHP version
        run: docker run --rm --entrypoint php myapp:latest -v | grep "8.4"

      - name: Test nginx config
        run: docker run --rm --add-host app:127.0.0.1 myapp-nginx nginx -t

      - name: Start stack
        run: |
          cp .env.example .env
          sed -i 's/CHANGE_ME_[A-Z_]*/ci_test/g' .env
          docker compose up -d

      - name: Wait for healthy
        run: |
          timeout 120 bash -c 'until docker compose ps | grep -q healthy; do sleep 5; done'

      - name: Test endpoint
        run: curl -f http://localhost/ || exit 1

      - name: Cleanup
        if: always()
        run: docker compose down -v
```

## Local boot-test pitfalls

When smoke/boot-testing an image by hand (not in the CI matrix):

- **Host-port collisions mislead.** If the published port (`-p HOST:CONTAINER`) is already taken by another container, `docker run -d` leaves the new container unstarted (it stays in `Created` state; the CLI typically exits non-zero, often `125`) while your `curl localhost:HOST` is answered by the _other_ container — a false pass, or a baffling failure. Use a free/unique host port, or skip `-p` and probe from inside: `docker exec <c> sh -c 'curl -sf localhost:<port>'`.
- **Foreground apps that log to a file leave `docker logs` empty.** E.g. Tomcat started with `-fg` writes to `logs/catalina.out`, not stdout — an empty `docker logs` does _not_ mean "nothing happened". Read the in-container log files (`docker exec <c> sh -c 'tail -n 80 .../catalina.out'`), and check the process and state (`docker inspect -f '{{.State.Status}} {{.State.ExitCode}}' <c>`).
- **Minimal/distroless images have no shell.** `docker exec … sh`/`tail`/`pgrep` won't exist on `scratch`/distroless runtimes — probe with host-side `curl` against a published port, `docker inspect` for state, or a debug sidecar (`docker run --rm --pid container:<c> busybox …`).
- **Grep for real failure signals, not benign noise.** After a bundled-dependency swap, scan logs for `NoSuchMethodError|AbstractMethodError|LinkageError|IncompatibleClassChangeError` (binary incompatibility) — not bare `ClassNotFoundException`, which OSGi/plugin frameworks emit normally.
