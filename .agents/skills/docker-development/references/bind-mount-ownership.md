# Bind-Mount Ownership: Root-Owned Artifacts on the Host

## The Problem

Containers that run as root and write into a bind-mounted project directory
leave **root-owned files on the host**. Typical producers:

```bash
docker compose run --rm app npm install     # node_modules/ now root-owned
docker compose run --rm app composer install
docker compose run --rm app npm run build  # dist/, public/build/ root-owned
```

The host user then hits failures that look unrelated:

```
npm error EACCES: permission denied, rename '.../node_modules/@babel/code-frame' -> ...
rm: cannot remove 'node_modules/...': Permission denied
```

Host-side `npm install`, build-tool cleanup steps (e.g. webpack/Encore
`cleanupOutputBeforeBuild`), and even `git clean -fdx` fail on these files.

## Diagnosis

```bash
find node_modules public/build -maxdepth 2 -user root | head
```

Any hit means a containerized process wrote there as root.

## Cleanup (no sudo required)

Use a throwaway container — root inside the container can delete what root
created, and the mount scopes it to the project:

```bash
docker run --rm -v "$PWD:/work" -w /work alpine \
  sh -c 'rm -rf node_modules public/build dist'
```

Then reinstall/rebuild as the host user.

## Prevention

### Run as the host user

Use the host UID/GID when running dev containers so files written by the container are owned by the host user. Example:

```bash
docker compose run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp app npm ci
```

The arbitrary UID typically has no writable home in the container; point HOME (or npm_config_cache) at a writable path so tools like npm can write caches.

### Fix the UID in the image

Create a user in the image that matches the typical host UID so container writes already have the right ownership. Example Dockerfile snippet:

```dockerfile
RUN adduser -u 1000 --disabled-password --gecos "" app
USER app
```

### Compose-wide

Set the user for development services in docker-compose so containers run with the expected UID/GID:

```yaml
user: "${UID:-1000}:${GID:-1000}"
```

Note: UID/GID are not exported by default in many shells (bash's UID is shell-only). Export them before composing or set them in the project .env file.

### Keep artifacts out of the mount

Avoid writing build artifacts into a bind mount. Options:

- Use a named volume for node_modules (e.g. `volumes: - node_modules:/app/node_modules`).
- Build inside the image (multi-stage) and copy artifacts into the image or a volume instead of into the mount.


Rootless Docker / userns-remap avoids the issue entirely but changes
semantics for the whole daemon.

## Related Gotcha: Named Volumes Mask Image Content

A named volume mounted over a path (e.g. `public/`) is populated from the
image **only on first use**. After deploying a new image, the volume still
holds the **old** content — refresh it explicitly (temp container +
`docker cp`/rsync) or recreate the volume as part of the deploy.
