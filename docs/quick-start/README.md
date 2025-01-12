# Retrom Quick Start Guide

> [!TIP]
> After you have completed this guide, you may want to check out the [other docs](../) to
> configure the rest of your Retrom experience.

<!--toc:start-->

- [Retrom Quick Start Guide](#retrom-quick-start-guide)
  - [Installation](#installation)
  - [First Time Setup](#first-time-setup)
  - [Initial Library Setup](#initial-library-setup)

<!--toc:end-->

## Installation

Follow the instructions in the [README](../../README.md#installation) to get Retrom up and running.

## First Time Setup

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

Check out the [README](https://github.com/JMBeresford/retrom#library-structure) to learn more about the options for the Structure option. Once your sources are added, and any invalid defaults are dealt with, you can initialize the library.

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
> [service configuration](../../README.md#server) section of the README.

You can also manually map your platforms to the correct metadata by accessing the `Platforms > Match Platforms` menu item.
This will allow you to select the correct platform identifier for each _platform directory_ in your library. This will
make subsequent metadata downloads more accurate.

After the job is complete, your client will look something like this:

> [!NOTE]
> You may need to restart your client to see all the metadata changes reflected.

![Metadata Downloaded Screenshot](./final.png)
