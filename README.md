<div align='center'>
  
  ![Banner][banner-link]
  
  ### A centralized game library/collection management service with a focus on emulation. Configure once, play anywhere.

  ---

  ### Check out the [quick start guide](https://github.com/JMBeresford/retrom/wiki/Quick-Start) or the full [wiki](https://github.com/JMBeresford/retrom/wiki)

  ### [Downoad the latest Client](https://github.com/JMBeresford/retrom/releases/latest)

  ---

  <h6>Join the Discord server:</h6>

  [![discord-badge]][discord-link]

</div>

<h2>Table of Contents</h2>

<!--toc:start-->

- [Overview](#overview)
- [Core Features](#core-features)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)

<!--toc:end-->

## Overview

Retrom is a centralized game library management service that allows you to host your games on a single device, and connect
clients on any amount of other devices to (un)install/download and play them when and where you want to! Think of it as a
sort of _self-hosted Steam_ for your DRM-free game library.

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

## Screenshots

**Home Screen**

![Screenshot 2024-10-10 at 10 49 08 AM](https://github.com/user-attachments/assets/f33a6530-e616-41c4-90d7-1273e0586439)

**Game View**

![Screenshot 2024-10-10 at 12 03 15 PM](https://github.com/user-attachments/assets/f22ced99-f9a6-43e4-a1ab-ef111b4be44a)

**Fullscreen Mode**

![image](https://github.com/user-attachments/assets/17b4458a-1698-41de-bf08-06ad7fe454ae)

![image](https://github.com/user-attachments/assets/c709b935-7b59-4e6f-9432-84e4d9928931)

![image](https://github.com/user-attachments/assets/da4aebb2-ac81-4783-a0fd-c9fe3e06a447)

## Roadmap

- [ ] Basic server functionality
  - [x] Scan filesystem for library items
  - [x] Add/remove library items
  - [x] Edit library items
  - [ ] Download metadata
    - [x] IGDB provider
    - [ ] SteamGridDB provider
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

[discord-badge]: https://invidget.switchblade.xyz/tM7VgWXCdZ
[discord-link]: https://discord.gg/tM7VgWXCdZ
[banner-link]: https://github.com/user-attachments/assets/f4af6a79-ce07-4605-8876-5dd2a9f94ed0
