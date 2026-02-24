# Quick Start Guide

## Installation

Retrom is composed of a server and a client. You can run Retrom in two ways:

- With a dedicated server
- In standalone mode, where Retrom manages the server for you under the hood

Both of these methods are covered below.

### No dedicated server needed

> [!TIP]
> If you find yourself questioning whether or not you _want_ a dedicated server ( or are not familiar with docker )
> then you probably don't want to bother with setting one up.

> [!TIP]
> If at any point you feel lost, or get stuck in the guide please reach out for help on Retrom's
> [discord server](https://discord.gg/tM7VgWXCdZ)!

If you are **not** planning to host a dedicated Retrom server, then you can
[download the latest client](https://github.com/JMBeresford/retrom/releases/latest) and move straight
to [first time setup](#first-time-setup)!

### Using a dedicated server

If you **do** plan to host a dedicated Retrom server, you should probably refer to the [installation instructions](./Installation)
for more detailed instructions. This quick start guide will be showcasing the simplest possible setup using _docker_, which should
serve most people just fine!

#### Prerequisites

1. Ensure you have [docker](https://docs.docker.com/get-started/get-docker/) installed along with the compose plugin.
2. Optionally, but recommended for simplicity, install the [compose plugin](https://docs.docker.com/compose/install/)
3. A game library that is in a [folder structure that Retrom understands](./Library-Structure)

#### Spin up the container

If using the compose plugin, the following `docker-compose.yml` file is all you need:

```yml
services:
  retrom:
    image: ghcr.io/jmberesford/retrom-service:latest
    ports:
      - 5101:5101
    volumes:
      - /path/to/my/library:/app/library
      - retrom-config:/app/config/
      - retrom-data:/app/data/

# anonymous volumes to persist data and config, or you can
# optionally bind mount these to a specific path on your host
# like done for the library directory above
volumes:
  retrom-data: # to persist data
  retrom-config: # to persist config
```

Run `docker compose up retrom` in the same directory as that file and the server will start up!

---

If you are using docker w/o the compose plugin, the following commands are analogous:

```sh
docker run --name retrom -d \
    -p 5101:5101 \
    --mount type=volume,target=/app/config \
    --mount type=volume,target=/app/data \
    --mount type=bind,src=/path/to/my/library,dst=/app/library \
    ghcr.io/jmberesford/retrom-service:latest
```

---

The server should now be running in the background! The service itself
will be accessible on port `5101` for desktop clients to connect to. The
web client will be accessible at `http://localhost:5101/` or `http://localhost:5101/web`
by default.

Make sure you [download the latest client](https://github.com/JMBeresford/retrom/releases/latest) and then continue to the next step.

## First Time Setup

> [!TIP]
> After you have completed this guide, you may want to check out the other docs to
> configure the rest of your Retrom experience.

Once you have your retrom server running, and a client installed locally you can begin setting up your library.
The first time you open your client, you should be greeted with a setup wizard:

![Screenshot 2025-01-11 at 7 03 24 PM](https://github.com/user-attachments/assets/03c41285-d298-4826-986c-f27339f7e51a)

If you are not using a dedicated server, then select Standalone Mode. Otherwise, select Connect to Server.

If you selected Connect to Server, you will be prompted for it's connection details on the next page:

![image](https://github.com/user-attachments/assets/23bae3df-7768-47d3-84eb-b5d1447050fe)

The hostname should be either the IP address of your Retrom service, or a domain name that points to it.

examples:

- `http://localhost` if you are running it locally, with default values
- `http://retrom.mydomain.com` if you have a domain name pointing to your Retrom service

The port should be the port that your Retrom service is listening on. The default is `5101`.

Following the above two use-cases:

- `5101` if you are running it locally, with default values
- `80` if you have a domain name pointing to your Retrom service with the `http` protocol
  `443` if using the `https` protocol. Or, you can leave it black and it will be inferred from
  the url you provide.

After you have entered the correct values, click `Next` to proceed to the next step.

![image](https://github.com/user-attachments/assets/ed16e32c-5bbf-46f2-87b5-021f689a9bbc)

This is where you will enter a name for this client. This allows the service to keep track of which client is which
when you add configs for local-specific things like emulators paths etc.

As this is the first client you are setting up, you can name it whatever you like. For each new client you set up, you
will need to give it a unique name, or you can alternatively use an existing client name to share the same config, or
restore an installation.

> [!CAUTION]
> If you share configs across clients, they need to have **exactly** the same paths configured for emulators and anything
> else that is client-specific. If you don't, you will run into issues when trying to launch games when one changes and
> the other no longer matches.
>
> If you are unsure, it is **highly recommended** to keep each _actively used_ client distinct.

After you have entered a name, click `Next` to proceed.

If you ever need to go through this setup again, you can do so by accessing the `File > Setup` menu item at any time.
You can also configure most of these options in the `File > Configuration` menu item.

## Initial Library Setup

You will likely see an empty library at first. The first thing you should do is add any library sources you have in the
configuration menu ( `File > Configuration` ):

![image](https://github.com/user-attachments/assets/5df452f0-c08d-46f4-a721-9198791411d2)

Check out the [Library Structure Docs](./Library-Structure) to learn more about the options for the Structure option. Once your sources are added, and any invalid defaults are dealt with, you can initialize the library.

To initialize your library, you can access the `Library > Update Library` menu item. This will scan the filesystem
that your service is running on and add any games/platforms it finds to your library. Your client will then look something
like this:

![image](https://github.com/user-attachments/assets/d9f40521-8288-4022-a3b3-b5d5950735d1)

Now you can start downloading metadata for your games by accessing the `Library > Download Metadata` menu item. This will
trigger a job in the service to download metadata from supported providers for all games in your library. It will do a best
effort to match the game to the correct metadata based on file structure, but you may need to manually adjust some games
if they are not fully accurate.

> [!TIP]
> This requires the service to have been properly configured to use the metadata providers. If you are unsure, check the
> [Metadata Providers Docs](./Metadata-Providers)

You can also manually map your platforms to the correct metadata by accessing the `Platforms > Match Platforms` menu item.
This will allow you to select the correct platform identifier for each _platform directory_ in your library. This will
make subsequent metadata downloads more accurate.

After the job is complete, your client will look something like this:

> [!NOTE]
> You may need to restart your client to see all the metadata changes reflected.

![image](https://github.com/user-attachments/assets/a10ef21c-83cb-4339-a342-6daa0259f080)

Make sure you [tell Retrom about your emulators](./Emulators-Config) and then get gaming!
