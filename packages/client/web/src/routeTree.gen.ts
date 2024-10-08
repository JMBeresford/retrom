/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as GamesGameIdIndexImport } from './routes/games/$gameId/index'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const GamesGameIdIndexRoute = GamesGameIdIndexImport.update({
  path: '/games/$gameId/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/games/$gameId/': {
      id: '/games/$gameId/'
      path: '/games/$gameId'
      fullPath: '/games/$gameId'
      preLoaderRoute: typeof GamesGameIdIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  GamesGameIdIndexRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/games/$gameId/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/games/$gameId/": {
      "filePath": "games/$gameId/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
