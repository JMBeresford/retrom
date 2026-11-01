# AGENTS.md

## Project summary

`@retrom/plugin-service-client` provides the client-side integration for Retrom's service layer. It
is responsible for service communication patterns and the boundary between client logic and backend
requests.

## Status

Active.

## Key relationships

- Integrates service/client communication for Retrom clients
- Uses generated protocol contracts and Tauri access patterns
- Supports plugin-driven communication flows rather than app-specific UI logic

## Typical edit locations

- service client wrapper code
- API-facing integration modules
- networking and request abstraction layers

## Validation

- verify service contract compatibility after protocol or API changes
- run the package's TypeScript/build checks when available
- check consuming clients or plugins when updating call patterns

## Important guidance

- Keep this package focused on service communication boundaries.
- Avoid embedding app-specific UI logic here.
- When protocol definitions change, propagate updates to the relevant consumers.
