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
> the [Example](../../README.md#docker-recommended) in the README for more information.

If you are running the server via Docker, you can update the server by simply pulling the latest image from the registry and
re-creating the container. All data is persisted in the database, so you won't lose any of your library data so long as you
only remove the service container.

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
4. Recreate the container, see the [README](../../README.md#docker-recommended) for more information on how to do this.

## Updating the Client

The client has an auto-update feature built in. When you start the client, it will check for updates and prompt you to install
them if any are available. If you have disabled this feature, or want to manually check for updates, you can do so by downloading
the latest release from the [Releases](https://github.com/jmberesford/retrom/releases) page.
