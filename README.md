# Retrom

A centralized game library/collection management service with a focus on emulation. Configure once, play anywhere.

> [!WARNING]  
> UNDER HEAVY DEVELOPMENT: Expect breaking changes often, update your installation with care.

## Overview

Retrom is a centralized game library management service that allows you to host your games on a single device, and connect
clients on any amount of other devices to (un)install/download and subsequently launch said games locally.

<!--toc:start-->

- [Retrom](#retrom)
  - [Overview](#overview)
  - [Core Features](#core-features)
  - [Screenshots and Recordings](#screenshots-and-recordings)
  - [Roadmap](#roadmap)
  - [Installation](#installation)
    - [Preparation](#preparation)
      - [Library Structure](#library-structure)
      - [Metadata Providers](#metadata-providers)
        - [IGDB](#igdb)
    - [Server](#server)
      - [Docker (Recommended)](#docker-recommended)
    - [Client](#client)
      - [Desktop Client](#desktop-client)
      - [Web Client](#web-client)

<!--toc:end-->

## Core Features

- Host your own cloud game library service
- Scan your filesystem for games/platforms and automatically add them to your library
- Install/uninstall and play games from the service on any amount of desktop
  clients.
  - **Support for Windows, MacOS, and Linux!**
- Access your library from anywhere with the web client.
- Manage emulator profiles on a per-client basis, stored on the server for easily
  sharing configurations between devices or restoring them after a reinstall.
- Launch all your games across any amount of emulators or platforms via your
  pre-configured profiles from a single library interface.
- Automatically download game metadata and artworks from supported providers
  to showcase your library with style!

## Screenshots and Recordings

**Home Screen**

![Retrom · 7 12pm · 08-25](https://github.com/user-attachments/assets/c5b72d5f-947b-4ba4-8df5-0eb8d48e52a6)

**Game View**

![Retrom](https://github.com/user-attachments/assets/31da1b2a-4460-4712-b16c-2bcf19cd5df0)

**Installing and launching**

https://github.com/user-attachments/assets/05146df5-9a44-41d0-992f-f59c65fb3ae1

## Roadmap

- [ ] Basic server functionality
  - [x] Scan filesystem for library items
  - [x] Add/remove library items
  - [x] Edit library items
  - [ ] Download metadata
    - [x] IGDB provider
    - [ ] SteamGridDB provider
    - [ ] The GamesDB (TGDB) provider
  - [ ] Cloud save games / states / emulator NANDs
  - [ ] (Multi-)User authentication
  - [ ] Publish server binaries, as an alternative to Docker
- [ ] Basic client functionality
  - [x] View library items
  - [x] Edit library metadata and artworks
  - [x] Trigger library update jobs
    - [x] Scan filesystem for new entries
    - [x] Download/update metadata for new entries
  - [x] Manage game files
    - [x] rename
    - [x] delete
    - [x] set default (for launching via emulators)
  - [ ] Grid view (as opposed to default list view)
  - [ ] Fullscreen mode + controller support
- [x] Web (browser) client functionality (in addition to Basic functionality)
  - [x] Download games
- [ ] Desktop client functionality (in addition to Basic functionality)
  - [x] Install/uninstall games
  - [x] Configure locally available emulators
  - [x] Configure multiple profiles per-emulator
  - [x] Set default profiles per-platform
  - [x] Launch games
  - [ ] Built-in emulator profiles for popular emulators

## Installation

> [!TIP]
> After installation, make sure to check out the [Quickstart guide](/docs/quick-start/README.md) to get
> up and running quickly.

> [!CAUTION]
> Retrom is designed **without** any specific security measures in mind. It is intended, and **highly recommended** that you run
> Retrom on a local network only. If you wish to expose Retrom to the internet, you should do so behind a reverse proxy
> with **proper security measures in place**. This is not a feature that is planned to be implemented in Retrom itself, as
> there are many variables to consider when hosting something and there is no one-size-fits-all solution.

### Preparation

#### Library Structure

Retrom requires a game library that is organized in a specific fashion. Each game should be
represented by a directory containing the game files (even for single-file games/platforms).
Each game should similarly be contained within a directory representing the platform it is played
on, and the platform directories should live at the root of your `library` directory.

Example:

```devicetree
library/
  game_guy/
    plumber_dude/
      plumber_dude.gg
    plumber_dude_2/
      plumber_dude_2_part_1.gg
      plumber_dude_2_part_2.gg
  game_guy_advance/
    plumber_dude_world/
      plumber_dude_world.gga
    plumber_dude_and_plumber_dudes_brother/
      plumber_dude_and_plumber_dudes_brother.gga
```

#### Metadata Providers

Retrom uses metadata providers to download metadata for your games. Currently, the only supported
provider is IGDB. Support for more providers is planned.

##### IGDB

To use the IGDB metadata provider, you will need to create an account on the IGDB website and
create a new application to get your client ID and secret. You can do this by following the
instructions [here](https://api-docs.igdb.com/#account-creation).

### Server

> [!NOTE]
> Requirements
>
> - Docker
> - Docker Compose (optional, but recommended)
> - A PostgreSQL database (can optionally use the example provided below)
> - A game library that is organized in [a way that Retrom can understand](#library-structure)
> - API keys for [metadata providers](#metadata-providers)

#### Docker (Recommended)

The currently recommended way to run the server is via Docker, ideally with `docker compose`.

This example `docker-compose.yml` file will get you started:

```yaml
retrom:
  image: ghcr.io/jmberesford/retrom-service:latest
  ports:
    - 5101:5101
  environment:
    # IGDB API information, see the metadata-providers section above for more info
    IGDB_CLIENT_ID: ${IGDB_CLIENT_ID}
    IGDB_CLIENT_SECRET: ${IGDB_CLIENT_SECRET}

    # using the below example postgres container
    DATABASE_URL: postgres://minecraft_steve:super_secret_password@retrom-db/retrom

    # or, bring your own database:
    # DATABASE_URL: postgres://{db_user}:{db_password}@{db_host}/{db_name}
  volumes:
    - /path/to/library:/app/library

# OPTIONAL: spin up a postgres container to use as the database. Or,
# you can use your own postgres instance by setting DATABASE_URL above
#
# read the docs here: https://hub.docker.com/_/postgres
retrom-db:
  container_name: retrom-db
  hostname: retrom-db
  image: postgres:16
  restart: unless-stopped
  volumes:
    # to store the DB data on the host
    - /path/to/pg_data:/var/lib/postgresql/data
  environment:
    POSTGRES_USER: minecraft_steve # db user, used to connect to the db
    POSTGRES_PASSWORD: super_secret_password # db password for above user
    POSTGRES_DB: retrom # db name
```

### Client

#### Desktop Client

Simply head to the [releases page](https://github.com/jmberesford/retrom/releases) and download the
latest version for your platform. The client is available for Windows, MacOS (both Intel and M series chips),
and Linux.

Occasionally, there may be debug builds present in a release. You should generally prefer
the non-debug builds, unless you were instructed to use a debug build by a developer for
debugging purposes. There will always be a non-debug version of any given release, just
look for an identically named file without the `-debug` suffix.

The following may help you differentiate between the different versions:

- `*-setup.exe` files are for Windows (prefer this over the .msi version, unless you have good reason not to)
- `*.msi` files are for Windows (prefer the .exe version over this)
- `*-x64.dmg` files are for MacOS on Intel chips
- `*-aarch64.dmg` files are for MacOS on M series chips
- `*-x64.AppImage` files are for Linux
- `*-x64.deb` files are for Linux (Debian-based distros)
- `*-x64.rpm` files are for Linux (Red Hat-based distros)

#### Web Client

> [!NOTE]
> There are plans to bundle the web client along with the service in a single container in the future,
> for ease of use.

The web client is currently only available as a Docker container. You can run it with the following
`docker-compose.yml` file, as an example:

```yaml
retrom-web:
  image: ghcr.io/jmberesford/retrom-web:latest
  container_name: retrom-web
  hostname: retrom-web
  ports:
    - 3000:3000
  environment:
    RETROM_HOST: http://retrom:5101 # the URL of your Retrom server
```
