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
        - [Multi-File Games (recommended)](#multi-file-games-recommended)
        - [Single-File Games](#single-file-games)
      - [Third Party Libraries](#third-party-libraries)
        - [Steam](#steam)
      - [Metadata Providers](#metadata-providers)
        - [IGDB](#igdb)
    - [Server](#server)
      - [Docker](#docker)
      - [Cargo](#cargo)
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

![Screenshot 2024-10-10 at 10 49 08 AM](https://github.com/user-attachments/assets/f33a6530-e616-41c4-90d7-1273e0586439)

**Game View**

![Screenshot 2024-10-10 at 12 03 15 PM](https://github.com/user-attachments/assets/f22ced99-f9a6-43e4-a1ab-ef111b4be44a)

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
> Retrom is designed **without** any specific security measures in mind. It is **highly recommended** that you run Retrom on a
> _local network only_ unless you know what you are doing. If you wish to expose Retrom to the internet, you should do
> so behind a reverse proxy with **proper security measures in place**. This is not a feature that is planned to be
> implemented in Retrom itself, as there are many variables to consider when hosting something and there is no
> one-size-fits-all solution.

### Preparation

#### Library Structure

Retrom currently supports libraries with the following structures:

##### Multi-File Games (recommended)

Each game should be
represented by a directory containing the game files (even for single-file games/platforms).
Each game should similarly be contained within a directory representing the platform it is played
on, and the platform directories should live at the root of your `library` directory.

Example:

Assume you have the games:

- Plumber Dude
- Plumber Dude 2

For the Game Guy platform, and the games:

- Plumber Dude World
- Plumber Dude and Plumber Dude's Brother

For the Game Guy Advance platform. Your library should look like this:

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

##### Single-File Games

Rather than each game being represented by a directory, you may have a library in which each game
is simple a single file in the respective platform directory.

Example:

Assume the same games and platforms as the example in [Multi-File Games](#multi-file-games-recommended).
Your library should look like this:

```devicetree
library/
  game_guy/
    plumber_dude.gg
    plumber_dude_2.gg
  game_guy_advance/
    plumber_dude_world.gga
    plumber_dude_and_plumber_dudes_brother.gga
```

#### Third Party Libraries

Retrom supports importing games from third-party libraries. Currently, the only supported third-party
library is Steam. Support for more third-party libraries is planned.

##### Steam

To import games from Steam, you will need to create a Steam API key. You can do this by following the
instructions [here](https://steamcommunity.com/dev/apikey).

You will also need your Steam ID. You can find your Steam ID by going to your
[Account Details](https://store.steampowered.com/account/) page on Steam ( you must be logged in to
view this page ).

You will see your Steam ID displayed below your profile name, as shown in the following image:

![Steam ID](docs/imgs/steam-id.png)

With these two pieces of information, you can import your Steam games into Retrom.
Add the following to the root of your `config.json` file:

```json
{
  "steam": {
    "api_key": "your_steam_api_key",
    "steam_id": "your_steam_id"
  }
}
```

Now, when you update your library and download metadata, your Steam games will be included and usable
from within Retrom!

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

The server is configured via a config file. Here is an example config file:

> [!TIP]
> You can replace the `db_url` with your own database URL

> [!CAUTION]
> The `path` in `content_directories` should be the path **inside the container**. If you are using Docker, you should
> mount your library directories to these paths. See the [Docker](#docker-recommended) section for more information.

```json
{
  "connection": {
    "port": 5101,
    "db_url": "postgres://minecraft_steve:super_secret_password@retrom-db/retrom"
  },
  "content_directories": [
    {
      "path": "path/to/my/library/",
      "storage_type": "MultiFileGame"
    },
    {
      "path": "path/to/my/library/with/single_file_games/",
      "storage_type": "SingleFileGame"
    }
  ],
  "igdb": {
    "client_secret": "super_secret_client_secret!!!1",
    "client_id": "my_IGDB_ID_1234"
  }
}
```

#### Docker

The currently recommended way to run the server is via Docker, ideally with `docker compose`. This
way is recommended because it is the easiest way to get started for those w/o a lot of experience
with setting up services and/or databases. There is no inherent reason that you cannot run the
service without Docker.

> [!TIP]
> If you are not familiar with Docker Compose, you can read the documentation [here](https://docs.docker.com/compose/).

Let's adjust the above example `config.json` for our docker container, and save it somewhere safe. In this
example, we'll assume it is saved to `/home/minecraft_steve/config_dir/config.json`. Note that we need a
config _directory_ to mount into the container, not just the file itself.

Let's also assume we have libraries at `/home/minecraft_steve/library1/` and at `/home/minecraft_steve/library2/`.

Here is the example config file:

```json
{
  "connection": {
    "port": 5101,
    "db_url": "postgres://minecraft_steve:super_secret_password@retrom-db/retrom"
  },
  "content_directories": [
    {
      "path": "/library1",
      "storage_type": "MultiFileGame"
    },
    {
      "path": "/library2",
      "storage_type": "SingleFileGame"
    }
  ],
  "igdb": {
    "client_secret": "super_secret_client_secret!!!1",
    "client_id": "my_IGDB_ID_1234"
  }
}
```

Then, this example `docker-compose.yml` file will get you started:

```yaml
services:
  retrom:
    image: ghcr.io/jmberesford/retrom-service:latest
    ports:
      - 5101:5101
      - 3000:3000 # to access the web client
    volumes:
      - /home/minecraft_steve/config_dir:/config/ # directory containing your config file
      - /home/minecraft_steve/library1:/library1 # directory containing your first library
      - /home/minecraft_steve/library2:/library2 # directory containing your second library

  # OPTIONAL: spin up a postgres container to use as the database, if you
  # don't have one already.
  #
  # read the docs here: https://hub.docker.com/_/postgres
  retrom-db:
    container_name: retrom-db
    hostname: retrom-db # this should match the db_url in your config file
    image: postgres:16
    restart: unless-stopped
    volumes:
      # to store the DB data on the host, change this path to any directory you like
      - /home/minecraft_steve/retrom_data/:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: minecraft_steve # db user, used to connect to the db, should match the db_user in your config file
      POSTGRES_PASSWORD: super_secret_password # db password for above user, should match the db_password in your config file
      POSTGRES_DB: retrom # db name, should match the db_name in your config file
```

You can then run `docker-compose up` in the directory containing your `docker-compose.yml` file to start the service.

The web client will be accessible at port 3000, and the service itself on port 5101 -- which can be accessed by any desktop clients.

#### Cargo

The Retrom Service is also available via Cargo. Installing via cargo will build the binary on your system, so you will need
to have the Rust toolchain installed. This means you can run the service without Docker, and you can run it on any platform
that Rust ( and Retrom's dependency list ) supports.

It is suggested to use [rustup](https://rustup.rs/) to install the Rust toolchain. You will also need to make sure you have
some dependencies installed on your system:

- `libssl-dev` (or equivalent for your system)
- `libpq-dev` (or equivalent for your system)

> [!CAUTION]
> You will not find support for these dependencies in this guide, as they are system-specific. Please refer to your
> system's package manager or the internet for help with installing these dependencies. If you do not know how
> to install these dependencies, you should use the [Docker](#docker-recommended) method instead.

If the pre-requisites are met, you can install Retrom via Cargo with the following command:

```sh
cargo install retrom-service
```

You can then run the service with the following command:

```sh
RETROM_CONFIG=/path/to/your/config.json retrom-service
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

> [!WARNING]
> The web client image has been deprecated. Use the web client bundled with the service image instead.
