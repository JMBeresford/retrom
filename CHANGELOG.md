# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.14](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.13...retrom-v0.1.14) - 2024-10-10

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

- *(web client)* download button

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

- *(client)* opt-out of platform filtering in IGDB searching

### Fixed

- *(service)* no longer relies on default config file
- *(client)* render single-file game names with dots
- *(client)* render multi-file game names with dots

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
- *(macOS)* app identifier

## [0.0.63](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.62...retrom-v0.0.63) - 2024-09-04

### Fixed
- no more node server

## [0.0.62](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.61...retrom-v0.0.62) - 2024-09-03

### Fixed
- nothing
