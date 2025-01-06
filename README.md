# Retrom

Join the discord server:

[![discord-badge]][discord-link]

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
      - [Metadata Providers](#metadata-providers)
        - [IGDB](#igdb)
    - [Server](#server)
      - [Standard Mode Setup](#standard-mode-setup)
        - [Docker](#docker)
        - [Cargo](#cargo)
    - [Client](#client)

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
  - [x] Fullscreen mode + controller support
- [x] Web (browser) client functionality (in addition to Basic functionality)
  - [x] Download games
  - [ ] In-browser emulation via [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS)
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

#### Metadata Providers

Retrom uses metadata providers to download metadata for your games. Currently, the only supported
provider is IGDB. Support for more providers is planned.

##### IGDB

To use the IGDB metadata provider, you will need to create an account on the IGDB website and
create a new application to get your client ID and secret. You can do this by following the
instructions [here](https://api-docs.igdb.com/#account-creation).

Once you have credentials, add the following to the root of your `config.json` file:

```json
{
  "igdb": {
    "clientId": "your_igdb_client_id",
    "clientSecret": "your_igdb_client_secret"
  }
}
```

### Server

Retrom is split into two components: the server and the client. The server is responsible for
storing your library and metadata, as well as handling client connections. In other words, the
server owns just about _everything_. Clients will simply connect to the server to view and interact
with the library.

There are two ways to use Retrom:

1. Standalone Mode

If you are not familiar with setting up services and/or databases,
and/or you do not care to have a dedicated server to host your Retrom library
then this is the mode for you. In this mode, you only need to download the client.
A server will be spun up on your local machine when you start the client.

> [!TIP]
> Other clients can connect to your local server, but only when the client is running.

> [!TIP]
> You can easily switch from Standalone Mode to Standard Mode at any time, if you opt to
> host your library on a dedicated server at a later date.

If you are interested in this mode, you can skip to the [Client](#client) section.

2. Standard Mode

This is your typical setup. You will run the server on a dedicated machine, and clients
will connect to it. This is the recommended mode for those who want to have a dedicated,
centralized Retrom server to host their library.

#### Standard Mode Setup

> [!NOTE]
> Requirements
>
> - A game library that is organized in [a way that Retrom can understand](#library-structure)
> - API keys for [metadata providers](#metadata-providers) (optional, but required for metadata)
> - Docker + Docker Compose (optional, but recommended)
> - A PostgreSQL database (optional, if you want to bring your own)

The server can be optionally configured via a config file. Here is a minimal example config file:

Desciption of the fields in the config file:

- `connection.port`: The port the server will listen on. Optional, and defaults to `5101` if not set.
- `connection.dbUrl`: The URL to a pre-exsiting PostgreSQL database. This is optional, for those
  who want to bring their own database.

```json
{
  "connection": {
    "port": 5101,
    "dbUrl": "postgres://minecraft_steve:super_secret_password@retrom-db/retrom"
  }
}
```

This file is generally only needed initially if you wish to override the defaults.

There are two ways to run the server:

1. [Docker](#docker)

The recommended way to run the server is via Docker. This ensures that everything is set up correctly
and that you have a consistent environment. This method also comes with the added benefit of a built-in
web client. This allows you to access and manage your library from literally any device with a browser.

2. [Cargo](#cargo)

Alternatively, you can run the server via Cargo. This method is only recommended for those who
do not want to use Docker _and_ are comfortable using command-line tools.

##### Docker

> [!TIP]
> If you are not familiar with Docker Compose, you can read the documentation [here](https://docs.docker.com/compose/).

For docker to see your library, you need to provide access to the directories containing your games.
This is done using docker volumes.

Let's assume we have libraries at `/home/minecraft_steve/library1/` and at `/home/minecraft_steve/library2/` on the host machine.
We need to provide access to these directories in the docker container. We can provide a map from these locations to
paths in the docker container by specifying the volumes in the `docker-compose.yml` file.

If you want to be able to interact with the config file on your host machine, you will also need to map to the
`/config/` directory in the container.

Here is a minimal example `docker-compose.yml` file:

```yaml
# docker-compose.yml

services:
  retrom:
    image: ghcr.io/jmberesford/retrom-service:latest
    ports:
      - 5101:5101
      - 3000:3000 # to access the web client
    volumes:
      - /home/minecraft_steve/library1:/library1 # directory containing your first library
      - /home/minecraft_steve/library2:/library2 # directory containing your second library
      - /home/minecraft_steve/config_dir:/config/ # OPTIONAL: directory containing your config file
```

You can then run `docker-compose up` in the directory containing your `docker-compose.yml` file to start the service.

The web client will be accessible at port 3000, and the service itself on port 5101 -- which can be accessed by any desktop clients.

##### Cargo

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
# If you have a config file, and are using a pre-existing database
cargo install retrom-service

# You can then run the service with the following command:
RETROM_CONFIG=/path/to/your/config.json retrom-service

# OR

# If you want Retrom to use it's own internal database
cargo install retrom-service --features embedded-db

# You can then run the service with the following command:
retrom-service
```

### Client

Simply head to the [releases page](https://github.com/jmberesford/retrom/releases) and download the
latest version for your platform. The client is available for Windows, MacOS (both Intel and M series chips),
and Linux.

The following may help you differentiate between the different versions:

- `*-setup.exe` files are for Windows (prefer this over the .msi version, unless you have good reason not to)
- `*.msi` files are for Windows (prefer the .exe version over this)
- `*-x64.dmg` files are for MacOS on Intel chips
- `*-aarch64.dmg` files are for MacOS on M series chips
- `*-x64.AppImage` files are for Linux
- `*-x64.deb` files are for Linux (Debian-based distros)
- `*-x64.rpm` files are for Linux (Red Hat-based distros)

Make sure to read the [Quickstart guide](/docs/quick-start/README.md) to get up and running quickly!

[discord-badge]: https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white
[discord-link]: https://discord.gg/tM7VgWXCdZ
