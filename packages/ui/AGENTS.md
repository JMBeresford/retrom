# AGENTS.md

> Deprecated: This package is no longer maintained and should not be used for new UI work unless
> explicitly instructed.

## Project summary

`@retrom/ui` is the legacy shared UI package for the previous frontend architecture. It is kept for
reference and compatibility but is not the active design-system target.

## Status

Deprecated.

## Key relationships

- Historical UI library for earlier frontend work
- Active styling and component work should prefer `packages/ui-next`
- Any edits here should be intentional and maintainer-requested

## Typical edit locations

- legacy component definitions
- older styling utilities and theme files
- compatibility layer code retained for historical support

## Validation

- only validate this package when a legacy issue is explicitly in scope
- prefer the modern UI package for any new design-system work

## Important guidance

- Do not treat this package as a live component library for future work.
- Use it only when the task explicitly concerns legacy behavior or migration support.
- Prefer `@retrom/ui-next` whenever a new UI task is not specifically about this deprecated package.
