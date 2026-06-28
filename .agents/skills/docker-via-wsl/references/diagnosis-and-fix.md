# Diagnosis and Fix: Wrong Bind Mount from a Windows Shell

Use this when a container's bind mount looks wrong (a phantom directory, an
empty mount, or `Is a directory` where a file was expected) and you suspect
Docker was driven from a Windows shell instead of from WSL.

## Diagnosis

```bash
# 1. What path did Docker actually mount? Look for a duplicated/odd segment.
docker inspect <container> --format '{{range .Mounts}}{{.Destination}} <- {{.Source}}{{"\n"}}{{end}}'

# 2. What does the container actually see vs the host?
docker exec <container> ls -la <mount-target>     # container view
ls -la <host-dir>                                 # host (Windows) view
#   Divergence (host shows file X, container shows empty or a phantom dir)
#   == path-translation mismatch -> you are driving Docker from Windows/SMB.

# 3. Confirm the WSL2 backend + which distro is integrated:
wsl.exe -l -v
```

A bind `.Source` containing `/run/desktop/mnt/host/uC/<ip>/...` (UNC-translated),
especially with a **doubled** directory segment, is the tell-tale sign.

## Fix

- Re-issue the command from inside WSL against the native Linux path:

  ```bash
  wsl.exe -e bash -lc "cd /home/<user>/<project> && docker compose up -d"
  ```

- If Docker already auto-created a phantom bind directory, remove it from the
  view that Docker uses (a throwaway container `rm -rf` on the mount, or delete
  it on the Linux filesystem), then recreate the container from WSL:

  ```bash
  wsl.exe -e bash -lc "docker run --rm -v /home/<user>/<project>:/work alpine rm -rf /work/<phantom-dir>"
  ```

- Keep the project on the Linux filesystem the WSL distro sees natively
  (`/home/<user>/...`), not browsed through a Windows drive letter or SMB share.
