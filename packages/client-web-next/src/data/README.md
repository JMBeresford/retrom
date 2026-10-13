# Data layer

This directory contains the client-side data access layer for the Next.js web app. It is organized around feature domains, each exposing a small set of TanStack Query query definitions and React hooks that call the generated RPC clients from `@retrom/codegen`.

## Purpose

`src/data` is the bridge between UI components and server APIs. Rather than calling RPC methods directly in components, each domain exposes:

- a `queries.ts` module defining query keys and reusable `queryOptions(...)` factories
- one or more `use-*.ts` hooks wrapping `useQuery(...)`
- optional `resources.ts` helpers for parsing resource IDs and other typed helpers

This keeps request configuration, caching, and data-fetching logic consistent across the app.

## Directory layout

```text
src/data/
├── common.ts
├── config/
│   ├── queries.ts
│   ├── use-get-server-config.ts
│   ├── use-get-server-info.ts
│   └── use-update-server-config.ts
├── emulators/
│   ├── queries.ts
│   ├── resources.ts
│   └── use-*.ts
├── files/
│   ├── queries.ts
│   └── use-*.ts
├── igdb/
│   ├── queries.ts
│   └── use-*.ts
├── libraries/
│   ├── queries.ts
│   ├── resources.ts
│   └── use-*.ts
├── metadata/
│   ├── queries.ts
│   └── use-*.ts
├── saves/
│   ├── queries.ts
│   └── use-*.ts
└── ...
```

A feature folder usually maps to one backend service or logical domain, such as config, metadata, libraries, or emulators.

## Shared conventions

### 1. Query keys are namespaced by domain

Each domain defines a query key object, usually named like `metadataQueryKeys`, `libraryQueryKeys`, or `configQueryKeys`.

```ts
export const metadataQueryKeys = {
  all: () => ["metadata"] as const,
  listGameMetadata: (request) =>
    [...metadataQueryKeys.all(), "listGameMetadata", request] as const,
};
```

This makes the cache keys stable, namespaced, and specific to the request payload.

### 2. Query factories return `queryOptions(...)`

The `queries.ts` files define query functions that accept:

- a request payload
- a `RetromClient`
- optional TanStack Query overrides

Example:

```ts
export const metadataQueries = {
  listGameMetadata: <TData>(
    request: MessageInitShape<typeof ListGameMetadataRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListGameMetadataResponse,
      ConnectError,
      TData,
      MetadataQueryKey<"listGameMetadata">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: metadataQueryKeys.listGameMetadata(request),
      queryFn: async () =>
        retromClient.metadataClient.listGameMetadata(request),
    }),
};
```

This pattern keeps the query definition reusable in multiple components or mutation flows without duplicating cache configuration.

### 3. Hooks wrap the query factory with `useQuery`

Each `use-*.ts` module resolves the app's RPC client and then calls the matching query factory.

```ts
export function useListGameMetadata<TData = ListGameMetadataResponse>(
  params: {
    request?: MessageInitShape<typeof ListGameMetadataRequestSchema>;
    options?: QueryOptionsExt<
      ListGameMetadataResponse,
      ConnectError,
      TData,
      MetadataQueryKey<"listGameMetadata">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    metadataQueries.listGameMetadata(request, retromClient, options),
  );
}
```

Typical hook signatures follow a consistent shape:

- `params.request?: ...`
- `params.options?: QueryOptionsExt<...>`
- `useRetromClient()` for the client instance
- `useQuery(...)` with the domain query object

### 4. Shared query option typing lives in `common.ts`

`common.ts` provides a reusable `QueryOptionsExt` helper that narrows the TanStack Query configuration while preserving the custom `queryKey` and `queryFn` pair.

```ts
export type QueryOptionsExt<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey = Array<unknown>,
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;
```

This keeps the domain modules consistent without repeating the same generic typing boilerplate.

## API client integration

The data layer does not instantiate network calls directly. It uses the app's shared client wrapper:

```ts
const retromClient = useRetromClient();
```

Then it calls the generated service client on the appropriate backend service:

```ts
retromClient.metadataClient.listGameMetadata(request);
retromClient.libraryClient.listLibraries(request);
retromClient.configClient.getServerInfo(request);
```

This means the UI can stay focused on rendering and behavior while the data layer manages data fetching, caching, and request typing.

## Resource helpers

Some domains include `resources.ts` files for parsing resource IDs or model identifiers from string paths. These are utilities layered on top of the service data model, not the query layer itself.

Examples include:

- `gameIdSchema`
- `platformIdSchema`
- `emulatorIdSchema`

These helpers are useful when data is represented by resource paths such as `games/12345` or `platforms/abc` and needs to be converted to stable ids before use in app code.

## How to add a new domain

When introducing a new service or data area:

1. Create a domain folder under `src/data/<domain>/`
2. Add a `queries.ts` file with:
   - `DomainQueryKey`
   - `domainQueryKeys`
   - `domainQueries`
3. Add `use-*.ts` hooks for each query method you need in the UI
4. Reuse `QueryOptionsExt` from `../common`
5. Resolve the RPC client through `useRetromClient()`
6. Keep the query key request payload and operation name in the key so cache entries stay unique and predictable

## Example pattern

```ts
export const exampleQueryKeys = {
  all: () => ["example"] as const,
  listItems: (request) => [...exampleQueryKeys.all(), "listItems", request],
};

export const exampleQueries = {
  listItems: (request, retromClient, options = {}) =>
    queryOptions({
      ...options,
      queryKey: exampleQueryKeys.listItems(request),
      queryFn: () => retromClient.exampleClient.listItems(request),
    }),
};
```

This is the standard shape used throughout the package: domain-scoped keys, shared request typing, and reusable query factories.

## Summary

The data layer in `packages/client-web-next/src/data` is a deliberately thin, consistent wrapper around the generated service clients. It favors small feature modules, typed query keys, and reusable hooks so the UI can use simple `useXxxQuery` patterns without repeating cache logic or API wiring.
