<div align='center'>
  
  ![Banner][banner-link]
  
### A centralized game library/collection management service with a focus on emulation. Configure once, play anywhere

---

### Check out the [quick start guide](https://github.com/JMBeresford/retrom/wiki/Quick-Start) or the full [wiki](https://github.com/JMBeresford/retrom/wiki)

### [Download the latest Client](https://github.com/JMBeresford/retrom/releases/latest)

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
- Unify your emulation library with third party libraries
  - Steam
  - GoG (soon™)
  - Native PC / Linux / MacOS games (experimental)
- Manage emulator profiles on a per-client basis, stored on the server for easily
  sharing configurations between devices or restoring them after a reinstall.
- Launch all your games across any amount of emulators or platforms via your
  pre-configured profiles from a single library interface.
- Automatically download game metadata and artworks from supported providers
  to showcase your library with style!

## Screenshots

 
### Home Screen

<div align='center'>
  <img src="https://github.com/user-attachments/assets/bb7015d1-823a-4247-8c7c-b0e6e0450018" />
  <span>
    <img width='49%' src="https://github.com/user-attachments/assets/653ef3fa-94d4-42cb-a319-d53673893601" />
    <img width='49%' src="https://github.com/user-attachments/assets/d7afce18-e2b2-47fa-bd0d-0d89b30fff8a" />
  </span>
  <span>
    <img width='49%' src="https://github.com/user-attachments/assets/9acd572a-7c56-479b-a359-84c4167009d3" />
    <img width='49%' src="https://github.com/user-attachments/assets/bf7d59bc-008f-4d36-9b63-dd20f67b18fa" />
  </span>
</div>


### Game Details

<div align='center'>
  <img src="https://github.com/user-attachments/assets/1518d684-e40e-4927-9065-cbe05f96c7c9" />
  <span>
    <img width="49%" src="https://github.com/user-attachments/assets/0330afa4-0798-4582-a334-70e9a0acf689" />
    <img width="49%" src="https://github.com/user-attachments/assets/19d8cf30-9eaf-4d69-a012-85837b58e1c2" />
  </span>
  <span>
    <img width="49%" src="https://github.com/user-attachments/assets/6d397e90-8868-4e7d-b677-cccdb9923768" />
    <img width="49%" src="https://github.com/user-attachments/assets/14582db8-cd18-4f3b-ad76-4ccfb23b2d3c" />
  </span>
</div>

### In Game

<div align='center'>
  <img src="https://github.com/user-attachments/assets/a19be565-098e-4335-b67b-ec2c87051e6e" />
  <span>
    <img width="49%" src="https://github.com/user-attachments/assets/d3ffa9b2-420b-4677-b930-dd7a1c0f272c" />
    <img width="49%" src="https://github.com/user-attachments/assets/0c47e301-af72-492b-b753-7b4d034a9f72" />
  </span>
  <span>
    <img width="49%" src="https://github.com/user-attachments/assets/9e254ea3-9ccb-453c-819c-49c26d40a57b" />
    <img width="49%" src="https://github.com/user-attachments/assets/a0b7f048-0206-47c5-8126-b7b03ffba896" />
  </span>
</div>

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
  - [x] In-browser emulation via [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS)
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
