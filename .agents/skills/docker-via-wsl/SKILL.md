---
name: docker-via-wsl
description: "Use when YOU (the AI agent) are running on Windows OUTSIDE WSL (Git Bash/MSYS/PowerShell shell) and need to run ANY docker / docker compose command. Docker Desktop runs on the WSL2 engine, so commands must be re-issued INSIDE WSL via wsl.exe -- running them from the Windows shell on a network/SMB drive (Z:, UNC) corrupts bind-mount paths. Does NOT apply if your shell is already inside WSL. Triggers on: docker, docker compose, docker-compose, container, bind mount, volume, 'is a directory', mount source wrong, Windows + Docker Desktop, WSL."
license: "(MIT AND CC-BY-SA-4.0)"
compatibility: "Windows host with Docker Desktop using the WSL2 backend."
metadata:
  version: "1.10.0"
  repository: "https://github.com/netresearch/docker-development-skill"
  author: "Netresearch DTT GmbH"
allowed-tools:
  - "Bash(wsl.exe:*)"
  - "Bash(docker:*)"
  - "Bash(uname:*)"
  - "Read"
  - "Glob"
  - "Grep"
---

# Docker via WSL (Windows)

## When this applies

This applies when **you, the AI agent, are running on a Windows host and your
shell is OUTSIDE WSL** -- your Bash tool is Git Bash/MSYS (`uname -s` shows
`MINGW64…`/`MSYS…`) or you are in PowerShell/cmd. The `docker` binary there
talks to Docker Desktop, but the daemon and its filesystem live in WSL2, so you
must run commands inside WSL via `wsl.exe`.

If your shell is **already inside WSL** (`uname -s` shows `Linux`, native path
`/home/<user>/...`), this skill does **not** apply -- run `docker` directly.

## The problem

On Windows, Docker Desktop's daemon runs **inside the WSL2 VM**. Issue **every
`docker` command** -- `run`, `build`, `exec`, `pull`, `push`,
`volume`, `network`, `inspect`, `compose`, … -- **from inside WSL**, against a
**native Linux path**. Never from a Windows shell (Git Bash/MSYS/PowerShell),
especially on a mapped network/SMB drive (`Z:`, UNC `\\host\share`).

## Why it matters

Driving Docker from a Windows shell whose CWD is on a network share forces
Docker Desktop to translate the Windows bind path (e.g. `Z:\proj\config`) into
a VM path. On SMB/UNC drives this is unreliable: it can **duplicate a path
segment** (e.g. `…/user/user/proj/config`), so Docker mounts a **wrong, empty
directory** and **auto-creates the missing bind source as an empty directory**.
A file the container expects (`init.sql`, a config file) then appears as a
**directory** -> `could not read from input file: Is a directory`. Your editor
writes still land on the _correct_ path via the share, so host and container
views silently diverge.

This is NOT a Docker cache bug nor a "single-file bind mounts are fragile"
problem (single-file binds work fine from WSL). The root cause is **piloting
Docker from Windows/SMB instead of from WSL**.

## The rule

Run **any** Docker command through WSL, in a native Linux path:

```bash
wsl.exe -e bash -lc "cd /home/<user>/<project> && docker compose up -d"
wsl.exe -e bash -lc "docker ps"
wsl.exe -e bash -lc "docker build -t myimg /home/<user>/<project>"
```

Keep the project on the **Linux filesystem** the WSL distro sees natively
(`/home/<user>/...`), not browsed through the Windows drive letter.

## Diagnosis and fix

See `references/diagnosis-and-fix.md` for inspecting the mounted path, comparing
host vs container views, and cleaning up a phantom bind directory.
