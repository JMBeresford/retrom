# Docker-in-Docker (DinD) Testing Patterns

Patterns for running Docker inside Docker in CI environments (Molecule, Testcontainers, nested builds).

## The Overlay-on-Overlay Problem

GitHub Actions runners (and most CI platforms) use the `overlay2` filesystem driver for Docker. When you run Docker inside Docker (e.g., Molecule testing Ansible roles, Testcontainers, nested builds), the inner Docker daemon also tries to use `overlay2`. The Linux kernel **cannot stack overlay-on-overlay** — this fails with:

```
mount source: "overlay", fstype: overlay, err: invalid argument
```

This affects any CI job that starts Docker containers from within a Docker container.

## Solution: VFS Storage Driver

Configure the **inner** Docker daemon to use the `vfs` storage driver instead of `overlay2`. VFS is slower (it copies full layers instead of using overlays) but works reliably inside containers.

### Direct daemon.json Configuration

```json
{
  "storage-driver": "vfs"
}
```

Write this to `/etc/docker/daemon.json` inside the container before starting Docker.

### GitHub Actions Service Container

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      dind:
        image: docker:dind
        env:
          DOCKER_OPTS: "--storage-driver=vfs"
        options: --privileged
```

## Systemd in Containers

When testing with containers that run systemd (e.g., Molecule testing on systemd-based OS images), additional configuration is required:

```yaml
# molecule/default/molecule.yml
platforms:
  - name: instance
    image: geerlingguy/docker-debian12-ansible:latest
    command: /lib/systemd/systemd
    privileged: true
    cgroupns_mode: host
    tmpfs:
      - /run
      - /run/lock
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
```

### Why These Settings

| Setting                         | Purpose                                               |
| ------------------------------- | ----------------------------------------------------- |
| `command: /lib/systemd/systemd` | Starts systemd as PID 1                               |
| `privileged: true`              | Grants access to host devices and cgroups             |
| `cgroupns_mode: host`           | Shares host cgroup namespace (required for cgroup v2) |
| `tmpfs: /run, /run/lock`        | Provides writable tmpfs for systemd runtime state     |
| `volumes: /sys/fs/cgroup`       | Mounts cgroup filesystem read-write                   |

## Privileged Mode

### When It Is Needed

- **Docker-in-Docker**: The inner Docker daemon needs to create network namespaces, mount filesystems, and manage cgroups
- **Systemd containers**: systemd requires cgroup access and device control
- **iptables/networking**: Containers that modify firewall rules or create network bridges

### Security Implications

- `--privileged` disables all security confinements (AppArmor, seccomp, capabilities)
- The container can access **all host devices** and modify the host kernel
- In CI, this is generally acceptable because the runner is ephemeral
- In production, **never** use `--privileged` — use specific `--cap-add` flags instead

```yaml
# Production alternative: grant only needed capabilities
docker run --cap-add SYS_ADMIN --cap-add NET_ADMIN --security-opt apparmor=unconfined myimage
```

## Alternative Approaches

### Docker Socket Mounting

Mount the host's Docker socket instead of running a full inner daemon:

```yaml
# The container uses the HOST's Docker daemon
docker run -v /var/run/docker.sock:/var/run/docker.sock myimage
```

**Pros**: No overlay-on-overlay issue, faster, less resource usage
**Cons**: Containers share the host daemon — no isolation, cleanup is shared, security risk (container can control host Docker)

### Podman Rootless

Podman runs without a daemon and supports rootless nested containers:

```yaml
# GitHub Actions
- name: Test with Podman
  run: |
    podman run --rm --privileged \
      -v ./:/workspace:Z \
      quay.io/podman/stable \
      podman build /workspace
```

### Buildah for Image Builds

If you only need to build images (not run containers), Buildah avoids DinD entirely:

```yaml
- name: Build with Buildah
  run: |
    buildah bud -t myimage:test .
    buildah push myimage:test docker-daemon:myimage:test
```

## Complete CI Example: Molecule with DinD

```yaml
name: Ansible Role CI

on: [push, pull_request]

jobs:
  molecule:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        distro:
          - debian12
          - ubuntu2404
          - rockylinux9

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pip install molecule molecule-plugins[docker] ansible

      - name: Run Molecule
        run: molecule test
        env:
          MOLECULE_DISTRO: ${{ matrix.distro }}
```

## Local test runs and disk space

Running container-based test suites locally — Molecule with `geerlingguy` systemd images, repeated nested builds, or rebuilding a CI image between iterations — creates a **fresh image and overlay layer per converge or rebuild**. These accumulate fast and can fill the host disk within a handful of runs. When the disk fills, even diagnostic commands fail to write their output, so you lose the very information needed to recover — prevention beats recovery.

**Before launching** a container test suite, check free space on the Docker storage filesystem:

```bash
df -h $(docker info -f '{{.DockerRootDir}}')
```

**After each run**, prune your own run's artifacts immediately — do not defer cleanup to the end of the session, by which point the disk may already be full:

```bash
docker container prune -f && docker image prune -f && docker builder prune -f
```

Pruning per-run keeps the working set small and surfaces a real disk problem early, while diagnostic commands can still write output.

## Troubleshooting

| Error                                     | Cause                           | Fix                                         |
| ----------------------------------------- | ------------------------------- | ------------------------------------------- |
| `mount: overlay: invalid argument`        | Overlay-on-overlay              | Set `storage-driver: vfs`                   |
| `Cannot connect to Docker daemon`         | Docker not started in container | Ensure `--privileged` and daemon is running |
| `failed to create shim task`              | Missing cgroup access           | Add `cgroupns_mode: host` and cgroup volume |
| `System has not been booted with systemd` | systemd not PID 1               | Set `command: /lib/systemd/systemd`         |
| `OCI runtime error: container_linux.go`   | Insufficient permissions        | Add `--privileged` or specific `--cap-add`  |
