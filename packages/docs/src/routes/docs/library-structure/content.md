# Library Structure

Retrom currently supports libraries with the following structures:

## Multi-File Games (recommended)

Each game should be represented by a directory containing the game files (even for single-file games/platforms).
Each game should similarly be contained within a directory representing the platform it is played
on, and the platform directories should live at the root of your `library` directory.

**Example:**

Assume you have the games:

- Plumber Dude
- Plumber Dude 2

For the _Game Guy_ platform, and the games:

- Plumber Dude World
- Plumber Dude and Plumber Dude's Brother

For the _Game Guy Advance_ platform. Your library should look like this:

```devicetree
library/
  game_guy/
    plumber_dude/
      plumber_dude.gg
    plumber_dude_2/
      plumber_dude_2_part_1.gg
      plumber_dude_2_part_2.gg
  game_guy_advance/
    plumber_dude_world/
      plumber_dude_world.gga
    plumber_dude_and_plumber_dudes_brother/
      plumber_dude_and_plumber_dudes_brother.gga
```

## Single-File Games

Rather than each game being represented by a directory, you may have a library in which each game
is simple a single file in the respective platform directory.

**Example:**

Assume the same games and platforms as the example in [Multi-File Games](#multi-file-games-recommended).
Your library should look like this:

```devicetree
library/
  game_guy/
    plumber_dude.gg
    plumber_dude_2.gg
  game_guy_advance/
    plumber_dude_world.gga
    plumber_dude_and_plumber_dudes_brother.gga
```

## Custom

You can also define your own structure for your library. As with the other options,
every entry must strictly adhere to the structure you define -- but you can define
just about any structure you want.

The structure is defined by using certain _macros_ to indicate where in the
library the required items live. In general, a macro is just some text surrounded in
braces ( e.g. `{library}` ). The following macros are available:

- `{library}`: The root of the library directory
  - this can be omitted in favor of having a single platform directory at the root,
    useful for adding one-off platforms that may not fit into your main library structure
- `{platform}`: Where platform directories will be found
- `{gameDir}`: Where game directories will be found
  - Cannot be used with `{gameFile}`
  - All items in the directory will be considered "part of the game"
- `{gameFile}`: Where single game files will be found

> [!TIP]
> The Single-File, and Multi-File Games structures could be defined as custom structures like so:
>
> ```sh
> # Single-File Games
> {library}/{platform}/{gameFile}
>
> # Multi-File Games
> {library}/{platform}/{gameDir}
> ```

You can also define custom macros. This is useful for semantic purposes, but will
also be used in the future to automatically apply _tags_ to games and platforms
based on the structure. This will allow for very powerful library management
based solely on the file and directory names in your library!

Any path section ( i.e. text between `/`'s ) surrounded in braces will be treated as a macro.

**Examples:**

Say we have the Single-File Games structure, but we want to store different _regions_ in their
own directories. We could define a custom structure like so:

```
{library}/{platform}/{region}/{gameFile}
```

Then, the following library structure would be valid:

```bash
library/ # ( the {library} macro )
  game_guy/ # ( the {platform} macro )
    usa/ # ( our custom {region} macro )
      plumber_dude.gg # ( the {gameFile} macro )
    europe/
      plumber_dude_europe.gg
  game_guy_advance/
    usa/
      plumber_dude_world.gga
    europe/
      plumber_dude_world_europe.gga
```

You can get as complex as you want with your custom structures, but remember that
each entry must follow the structure you define exactly! Any orphaned items will be
either ignored, or worse, be considered an entry of the wrong kind.

Use the included generated example in the Client when editing your definition to ensure
that Retrom expects the same structure you do:

![image](https://github.com/user-attachments/assets/6ce743a9-df41-46cf-87ab-b1c7bb68e16d)
