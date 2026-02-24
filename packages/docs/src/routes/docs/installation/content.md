# Installation

> [!TIP]
> After installation, make sure to check out the [Quickstart guide](./Quick-Start) to get
> up and running quickly.

> [!CAUTION]
> Retrom is designed **without** any specific security measures in mind. It is **highly recommended** that you run Retrom on a
> _local network only_ unless you know what you are doing. If you wish to expose Retrom to the internet, you should do
> so behind a reverse proxy with **proper security measures in place**. This is not a feature that is planned to be
> implemented in Retrom itself, as there are many variables to consider when hosting something and there is no
> one-size-fits-all solution.

## Preparation

### Library Structure

Ensure your library is organized in a way that Retrom can understand. See the [Library Structure](./Library-Structure) page for more information.

### Metadata Providers

Follow the instructions on the [Metadata Providers](./Metadata-Providers) page if you want to fetch metadata for your library.
Without this, you will not have any metadata or artwork for your games.

## Installation

### Server Installation

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
> Other clients can connect to your standalone server, but only when this client is running.

> [!TIP]
> You can easily switch from Standalone Mode to Standard Mode at any time if you opt to
> host your library on a dedicated server at a later date.

If you are interested in this mode, you can skip to the [Client](#client) section. Make sure to follow the
[Quickstart guide](./Quick-Start) after you have installed the client.

2. Standard Mode (Recommended)

This is your typical setup. You will run the server on a dedicated machine, and clients
will connect to it. This is the recommended mode for those who want to have a dedicated,
centralized Retrom server to host their library.

#### Standard Mode Setup

> [!NOTE]
> Requirements
>
> - A game library that is organized in [a way that Retrom can understand](./Library-Structure)
> - API keys for [metadata providers](./Metadata-Providers) (optional, but required for metadata)
> - Docker + Docker Compose (optional, but recommended), OR [Cargo](https://crates.io/)
> - A PostgreSQL database (optional, if you want to bring your own)

> [!TIP]
> The server can be _optionally_ configured via a config file. **The server config can also be
> managed from the client, which is the recommended approach!**
>
> Read more at the [Configuration](./Configuration#server-config) page

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
paths in the docker container by specifying them as [bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
in the `docker-compose.yml` file.

If you want to be able to interact with the config file on your host machine, you will also need to map to the
`/app/config/` directory in the container. This is optional, and generally not recommended unless you know what you are doing.
As such, the example below will use a regular docker volume to persist the config and data directories.

> [!TIP]
> Read more about docker volumes [here](https://docs.docker.com/storage/volumes/).

Here is a minimal example `docker-compose.yml` file:

```yaml
# docker-compose.yml

services:
  retrom:
    image: ghcr.io/jmberesford/retrom-service:latest
    ports:
      - 5101:5101
    volumes:
      # {directory containing your first library}:{path in container}
      - /home/minecraft_steve/library1:/app/library1
      # {directory containing your second library}:path in container
      - /home/minecraft_steve/library2:/app/library2
      - ... # add more volumes for more libraries as needed
      - retrom-config:/app/config/
      - retrom-data:/app/data/

volumes:
  retrom-data: # to persist data
  retrom-config: # to persist config
```

You can then run `docker-compose up` in the directory containing your `docker-compose.yml` file to start the service.

The service itself on port `5101`, which can be accessed by any desktop clients, and the
web client will be accessible at `http://localhost:5101/` or `http://localhost:5101/web`
by default.

##### Cargo

The Retrom Service is also available via Cargo. Installing via cargo will build the binary on your system, so you will need
to have the Rust toolchain installed. This means you can run the service without Docker, and you can run it on any platform
that Rust ( and Retrom's dependency list ) supports.

It is suggested to use [rustup](https://rustup.rs/) to install the Rust toolchain. You will also need to make sure you have
some dependencies installed on your system:

- `libssl` (or equivalent for your system)
- `libpq` (or equivalent for your system)
- `libprotobuf` (or equivalent for your system)

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
cargo install retrom-service --features embedded_db

# You can then run the service with the following command:
retrom-service
```

#### Client

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

Make sure to read the [Quickstart guide](./Quick-Start) to get up and running quickly!
