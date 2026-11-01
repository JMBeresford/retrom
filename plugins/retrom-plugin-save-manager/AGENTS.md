# AGENTS.md

## Project summary

`@retrom/plugin-save-manager` manages save-state and save-data operations for the Retrom ecosystem.
It is focused on preserving, reading, and organizing user save data.

## Status

Active.

## Key relationships

- Depends on generated code and Tauri APIs
- Used for save-state and save-data operations and related game lifecycle tasks
- Keeps file-state handling separate from direct UI rendering

## Typical edit locations

- save-state management and file operation logic
- lifecycle or metadata handling for save data
- integration points with generated contracts

## Validation

- validate save-state behavior and file operations after changes
- use TypeScript/build checks for the package when available
- review any consumer paths that depend on save-state semantics

## Important guidance

- Keep file handling and error cases deliberate and well-scoped.
- Treat this package as operational infrastructure, not presentation code.
