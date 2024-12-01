# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [0.4.6](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.5...retrom-v0.4.6) - 2024-12-01

### Fixes
- Fullscreen action button

    The Play/Install/Download button in the fullscreen layout
    now correctly responds to gamepad input.



- link rendering in changelog



### New
- steam integration

    You can now opt-in to populate your library with your Steam games. This is
    done by adding your Steam config to the service config file.



- scanned games are matched by platform

    Library scans will now take a games platform into account when matching
    via IGDB.



- prioritize exact matches in IGDB search by default

    fixes [#168](https://github.com/JMBeresford/retrom/pull/168)



- Fullscreen game list names

    Fullscreen mode now shows the names of the games in the grid view,
    where applicable.




## [0.4.5](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.4...retrom-v0.4.5) - 2024-11-22

### Fixes
- don't show empty platforms in fullscreen mode

    resolves [#182](https://github.com/JMBeresford/retrom/pull/182)



- EGL Bad Parameter error on some devices


## [0.4.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.3...retrom-v0.4.4) - 2024-11-19

### Fixes
- better handle certain networking configs

    Networking configurations that do not support the GRPC protocol are now
    supported.




## [0.4.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.2...retrom-v0.4.3) - 2024-11-19

### Fixes
- UI Tweaks

    Fullscreen mode menus now work properly on smaller screen sizes.
    Navigation via gamepad/hotkeys in fullscreen mode is now more intuitive.
    Fullscreen mode now sorts platforms alphabetically.




## [0.4.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.1...retrom-v0.4.2) - 2024-11-17

### Fixes
- auto-updating



### New
- announcement system

    Retrom now has an announcement system that can be used to display
    important messages without requiring a new release. This is useful for
    getting notified about breakages in current versions or new features
    that are available.



- fullscreen game page overhaul

    The game page in fullscreen mode was unfortunately prone to bugs and
    inconsistencies on various screen sizes. This overhaul cleans up the UI
    to make it more compatible with different screen sizes and resolutions,
    and to make it more intuitive to use.




## [0.4.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.0...retrom-v0.4.1) - 2024-11-13

### Fixes
- home screen scrolling to bottom

    The home screen no longer scrolls to the bottom of the page on
    initial load.




## [0.4.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.3...retrom-v0.4.0) - 2024-11-11

### New
- initial gamepad support

    Retrom now supports most Xbox and PlayStation controllers
- [**breaking**] fullscreen mode ([#173](https://github.com/JMBeresford/retrom/pull/173))

    Fullscreen mode now available in the `View` menu item
## [0.3.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.2...retrom-v0.3.3) - 2024-11-08

### New
- indicate installation status in side bar

    Installed games are now highlighted in the side bar. They are also
    grouped together at the top of the list with an option to opt-out of
    this behavior.
## [0.3.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.1...retrom-v0.3.2) - 2024-10-26

### Fixes
- MultiFileGame installations
## [0.3.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.0...retrom-v0.3.1) - 2024-10-24

### Fixes
- sub-directories in game files

    Any sub-directories in a MultiFileGame's directory is now properly
    scanned and added to the game's file list. Installing such games from
    the desktop client now works as expected, as does downloading them from
    the web client.
- UI Tweaks

    Updated changlog to look _more prettier_

### New
- allow deleted games to be re-imported

    Now when deleting a game, blacklisting it from future library scans is
    optional. This is useful for games that have malformed data and need to
    be reset completely.
## [0.3.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.8...retrom-v0.3.0) - 2024-10-21

### Added
- [**breaking**] shared emulator profiles

    Emulators are no longer scoped to a single client. Any per-client
    configuration is now distinct from the emulators -- and, by extension,
    their profiles -- themselves. This means that profiles can now be used
    across clients!
## [0.2.8](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.7...retrom-v0.2.8) - 2024-10-21

### Added
- `install_dir` macro for custom args

    Now you can use the `install_dir` macro in your profile's custom args to
    specify the installation directory for the game. This will allow you
    launch multi-file games with emulators that require a directory of
    files ( e.g. RPCS3 ).
## [0.2.7](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.6...retrom-v0.2.7) - 2024-10-17

### Fixed
- installed games filenames

    Installing games now properly omit's any quotes that wrap the filename,
    fixing the issue where games could not be installed on windows.

    Additionally, filenames now no longer strip the file extension.
## [0.2.6](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.5...retrom-v0.2.6) - 2024-10-17

### Fixed
- creating log file

    Retrom now checks to make sure the log directory exists before
    trying to create a log file. It also places the log file in the
    OS-specific idiomatic location for log files.
## [0.2.5](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.4...retrom-v0.2.5) - 2024-10-17

### Added
- client log file
## [0.2.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.3...retrom-v0.2.4) - 2024-10-15

### Fixed
- *(Web Client)* Fix downloading games w/ commas in name

    Downloading games with commas in the file name now works as expected,
    rather than failing with a `Multiple Content-Disposition` error.
## [0.2.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.2...retrom-v0.2.3) - 2024-10-13

### Fixed
- emulator save strategy dropdown

    The dropdown will now properly reset the rendered value when an emulator
    is added.
- *(client)* indent changelog bodies
## [0.2.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.1...retrom-v0.2.2) - 2024-10-13

### Fixed
- *(client)* render new version number correctly

    The new version number in the update modal will now be rendered correctly,
    rather than render `[object Object]`.

## [0.2.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.0...retrom-v0.2.1) - 2024-10-11

### Fixed

- _(service)_ better error logs
- _(web client)_ use service port defined in config file

## [0.2.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.13...retrom-v0.2.0) - 2024-10-10

### Fixed

- per-client default emulator profiles
- default profiles modal UI tweaks

## [0.1.13](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.12...retrom-v0.1.13) - 2024-10-01

### Added

- version modals added to menubar

### Fixed

- UI tweaks
- semantics of manual metadata update modal

## [0.1.12](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.11...retrom-v0.1.12) - 2024-09-30

### Added

- UI tweaks
- sort by time played + sort fixes

### Fixed

- _(web client)_ download button

## [0.1.10](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.9...retrom-v0.1.10) - 2024-09-27

### Added

- web client bundled with service docker image ([#134](https://github.com/JMBeresford/retrom/pull/134))

## [0.1.9](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.8...retrom-v0.1.9) - 2024-09-27

### Fixed

- game name rendering

## [0.1.8](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.7...retrom-v0.1.8) - 2024-09-27

### Fixed

- restore legacy content dir + fix config loading

## [0.1.7](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.6...retrom-v0.1.7) - 2024-09-26

### Added

- _(client)_ opt-out of platform filtering in IGDB searching

### Fixed

- _(service)_ no longer relies on default config file
- _(client)_ render single-file game names with dots
- _(client)_ render multi-file game names with dots

## [0.1.6](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.5...retrom-v0.1.6) - 2024-09-26

### Fixed

- game details UI tweaks
- idle job text is correct color

## [0.1.5](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.4...retrom-v0.1.5) - 2024-09-26

### Fixed

- extra metadata job

## [0.1.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.3...retrom-v0.1.4) - 2024-09-25

### Fixed

- external links
- better similar games searching

## [0.1.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.2...retrom-v0.1.3) - 2024-09-24

### Fixed

- sidebar tooltips no longer block cursor

## [0.1.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.1...retrom-v0.1.2) - 2024-09-24

### Fixed

- fallback to deprecated CONTENT_DIR envvar
- sidebar sorting

## [0.1.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.0...retrom-v0.1.1) - 2024-09-24

### Added

- search and sort sidebar entries

## [0.1.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.81...retrom-v0.1.0) - 2024-09-22

### Added

- [**breaking**] allow single file lib structure

## [0.0.81](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.80...retrom-v0.0.81) - 2024-09-22

### Added

- warn on breaking changes

## [0.0.80](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.79...retrom-v0.0.80) - 2024-09-18

### Fixed

- custom arg parsing
- emulator profile modal width

## [0.0.79](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.78...retrom-v0.0.79) - 2024-09-16

### Fixed

- match games by igdb ID

## [0.0.78](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.77...retrom-v0.0.78) - 2024-09-15

### Fixed

- tls in launcher plugin

## [0.0.77](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.76...retrom-v0.0.77) - 2024-09-13

### Fixed

- emulator modal file picker

## [0.0.76](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.75...retrom-v0.0.76) - 2024-09-13

### Fixed

- static link libpq

## [0.0.75](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.74...retrom-v0.0.75) - 2024-09-13

### Fixed

- doc links + UI tweaks

## [0.0.74](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.73...retrom-v0.0.74) - 2024-09-11

### Fixed

- 64-bit nums

## [0.0.73](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.72...retrom-v0.0.73) - 2024-09-11

### Fixed

- macOS entitlements for notarization

## [0.0.72](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.71...retrom-v0.0.72) - 2024-09-08

### Fixed

- macOS build signing

## [0.0.71](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.70...retrom-v0.0.71) - 2024-09-08

### Added

- refresh data on metadata job done

## [0.0.70](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.69...retrom-v0.0.70) - 2024-09-05

### Added

- modal refactor

## [0.0.69](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.68...retrom-v0.0.69) - 2024-09-05

### Fixed

- sync config on desktop app

## [0.0.65](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.64...retrom-v0.0.65) - 2024-09-04

### Fixed

- updating -> relaunching

## [0.0.64](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.63...retrom-v0.0.64) - 2024-09-04

### Fixed

- _(macOS)_ app identifier

## [0.0.63](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.62...retrom-v0.0.63) - 2024-09-04

### Fixed

- no more node server

## [0.0.62](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.61...retrom-v0.0.62) - 2024-09-03

### Fixed

- nothing
