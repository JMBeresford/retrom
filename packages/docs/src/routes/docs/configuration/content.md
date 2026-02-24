# Configuration

There are various configuration files that Retrom uses to store/persist certain preferences.

These configuration files can be modified directly **if needed**, but the intention is for preferences to be modified
via the client UI. The client will do its best to validate any changes to prevent any errors. Human readability of
all values in the file are _not guaranteed_.

Some values are only used internally, and will not necessarily be documented here nor seen in the client.
Similarly, some values which are deemed self-explanatory will not be documented here.

# Server Config

## Content Directories

Content directories are the locations on disk that the server will scan for games and platforms.
These directories can follow one of multiple [Library Structures](./Library-Structure) -- but each
entry in the directory must follow the same structure.

Each content directory entry has the following fields:

- `path`: The path to the directory for this source
- `storageType`: An identifier that marks which [Library Structure](./Library-Structure) the source follows
- `ignorePatterns`: An array of _regular expressions_ that will be used to ignore files and directories in scans

### Ignore Patterns

> [!TIP]
> Read up on regular expressions if you're not familiar with them.
> They can be quite powerful, but also quite complex.

When an ignore pattern is matched, the file or directory will be skipped during the
scan -- **including all of its contents**.

For example, if you have the following library structure:

```tree
library/
  game_guy/
    game1/
      ...
    game2/
      ...
  game_guy_advanced/
    unorganized_game_1/
    unorganized_game_2/
```

You could keep Retrom from scanning the `game_guy_advanced` directory by adding the following
ignore pattern: `game_guy_advanced`. So long as Retrom has not already scanned the directory,
it will not be added to the library while the ignore pattern exists.

Note that simple ignore patterns can lead to unexpected behavior if not careful. For example,
if you had instead added the ignore pattern `game_guy`, Retrom would skip both the `game_guy`
and `game_guy_advanced` directories, as the pattern `game_guy` would match both directories.
Additionally, if _by chance_ there was a game for a completely different platform in the
content directory that just so happened to have _game_guy_ in its name, it would also be skipped!

**As such, be as specific as possible with your ignore patterns!**

In this case, you could use the ignore pattern `game_guy$`, or `library/game_guy$` to
match only the `game_guy` directory ( `$` is an anchor that matches the end of the string ).

Note that all ignore patterns are matched against the path of the items **relative to the
content directory**. This means that the ignore patterns `game_guy_advanced` and
`library/game_guy_advanced` would match the directory `game_guy_advanced` in the
above example, but `/app/library/game_guy_advanced` would _not_.

This also means that the `^` anchor ( anchor that matches the _beginning_ of the string )
must be used with caution. In the above example, `^library/game_guy_advanced` would
match the directory `game_guy_advanced`, but `^game_guy_advanced` would _not_.

When in doubt, test your ignore patterns with a tool like [regex101](https://regex101.com/).

#### Common Recipes

MacOS users may want to ignore `.DS_Store` files with this ignore filter:

```regex
(?i)\.ds_store$
```

## IGDB

IGDB is used to collect metadata for games and platforms. The IGDB configuration has the following fields:

- `clientId`: The client ID for the IGDB API
- `clientSecret`: The client secret for the IGDB API

See the [IGDB Metadata Provider docs](./Metadata-Providers#igdb) for more information.

## Steam

Steam is an opt-in third-party integration that allows Retrom to display and manage metadata for your
Steam library. Retrom requires credentials to access your Steam library, and the Steam configuration
has the following fields:

- `apiKey`: The API key for the Steam API
- `userId`: Your Steam user ID

See the [Steam integration docs](./Third-Party-Integrations#steam) for more information.

## Connection (config file only)

- `port`: The port the **server** will listen on. Optional, and defaults to `5101` if not set.
- `dbUrl`: The URL to a pre-existing PostgreSQL database. This is optional, for those
  who want to bring their own database server.

Here is an example server config file:

```json
{
  "connection": {
    "port": 5101,
    "dbUrl": "postgres://username:password@database-ip-or-domain/database-name"
  },
  "contentDirectories": [
    { "path": "/app/library1/", "storageType": "MultiFileGame" },
    { "path": "/app/library2/", "storageType": "SingleFileGame" }
  ],
  "igdb": {
    "clientId": "1234",
    "clientSecret": "my_super_secret_secret_in_plain_text"
  },
  "steam": {
    "apiKey": "4321",
    "userId": "1337"
  }
}
```

# Client Config

## General

- **Installation Directory**: The directory where Retrom installs games
- **Fullscreen by default**: When this is set to `true`, Retrom will...
  start in fullscreen mode, believe it or not!

## Connection

- **Standalone mode**: When this is set to `true`, Retrom will run in stand-alone
  mode, which means it will use a locally managed server rather than connecting to
  a remote server.

  - When this is false, you can modify the `hostname` and `port` fields to connect
    to a remote server.

# Config File Locations

## Server

Server config files will be found in `/app/config/` in your docker container -- or
on your host machine as defined in your bind mount, if using one
( see the [installation docs](./Installation#docker) for more info on this )

## Client

Client config files will be in OS-dependant locations:

- Windows: `$APP_DATA/roaming/com.retrom.app`
- MacOS: `$HOME/Library/Application Support/com.retrom.app`
- Linux: `$XDG_CONFIG_HOME/com.retrom.app or $HOME/.config/com.retrom.app`

In particular, there should be no reason to directly modify this file. All client
preferences should be managed via the menus therein.
