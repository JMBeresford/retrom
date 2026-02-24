# Updating Retrom

Retrom is composed of both a server, and any amount of clients. The server is responsible for managing your library,
and the clients are responsible for interacting with the server to view and play your games. This guide will walk you
through updating the server and the client(s) you use to interact with it.

> [!CAUTION]
> You should **always** keep your server and client(s) versions in sync. While minor version updates will _sometimes_ be _partially_ compatible,
> is is not guaranteed. If you are unsure, it is best to update both the server and client(s) at the same time.

## Updating the Server

### Docker (Recommended)

> [!TIP]
> It is recommended to use Docker Compose to coordinate your retrom service and, optionally, database containers. Check out
> the [Example](./Installation#docker) in the installation instructions for more information.

If you are running the server via Docker, you can update the server by simply pulling the latest image from the registry and
re-creating the container. All data is persisted in the database, so you won't lose any of your library data so long as you
only remove the service container.

If you are using a compose file, you can update the server with the following steps:

1. Pull the latest image:

   ```sh
   docker compose pull
   ```

2. Recreate the container:

   ```sh
   docker compose up --force-recreate --build -d
   ```

3. Remove the old image:

   ```sh
   docker image prune -f
   ```

Or, if using docker w/o compose:

1. Pull the latest image:

   ```sh
   docker pull ghcr.io/jmberesford/retrom-service:latest
   ```

2. Stop the existing container:

   ```sh
   docker stop retrom # or whatever you named your container
   ```

3. Remove the existing container:

   ```sh
   docker rm retrom # or whatever you named your container
   ```

4. Recreate the container, see the [Installation instructions](./Installation#docker) for more information on how to do this.

## Updating the Client

The client has an auto-update feature built in. When you start the client, it will check for updates and prompt you to install
them if any are available. If you have disabled this feature, are using an incompatible client build ( e.g. `rpm` or `deb` bundles),
or want to manually check for updates, you can do so by downloading the latest release from the
[Releases](https://github.com/jmberesford/retrom/releases) page.

## Backing up your configuration and data

Generally speaking, you should not need to back up your configurations, as client configurations are stored in the server database
and server configurations should be stored in a persistent volume. However, in the event that you need to back up your configurations,
the following locations are where you should look:

### Server

If you are running the server via docker, and are using _bind mounts_ for your config and data directories, you will find your files
on your host machine in the directory you specified in your `docker-compose.yml` file.

If you are using a _volume_ for your config and data directories, you will want to copy the data from the container.
You can copy to your host machine with the following command(s):

Assume the following docker-compose.yml file ( see the [Installation instructions](./Installation#docker) for more information ):

```yaml
services:
  retrom:
    # ... other service stuff
    volumes:
      - retrom-config:/app/config/
      - retrom-data:/app/data/

volumes:
  retrom-data:
  retrom-config:
```

```sh
docker compose cp retrom:/app/config/ /path/to/backup/on/local/machine
docker compose cp retrom:/app/data/ /path/to/backup/on/local/machine
```

### Client

Client configuration and data files are stored in OS-specific directories. You can find them in the following locations:

- **Windows**: `%APPDATA%\roaming\com.retrom.client` and `%APPDATA%\local\com.retrom.client`
- **Linux**: `~/.config/com.retrom.client`, or `~/.local/share/com.retrom.client` -- generally, `$XDG_CONFIG_HOME` and `$XDG_DATA_HOME` are respected
- **macOS**: `~/Library/Application Support/com.retrom.client`
