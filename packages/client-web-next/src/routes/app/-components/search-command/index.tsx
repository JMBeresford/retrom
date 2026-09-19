import { formatForDisplay, useHotkey } from "@tanstack/react-hotkeys";
import { Kbd } from "@retrom/ui-next/components/kbd";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@retrom/ui-next/components/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@retrom/ui-next/components/input-group";
import { useState } from "react";
import { Search } from "lucide-react";
import { SearchCommandContext } from "./context";
import { GamesSearch } from "./games-search";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const searchCtx = useState("");
  const [search, setSearch] = searchCtx;

  useHotkey("Mod+K", () => setOpen(true));

  return (
    <SearchCommandContext.Provider value={searchCtx}>
      <InputGroup>
        <InputGroupInput
          readOnly
          placeholder="Search"
          onClick={() => setOpen(true)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>

        <InputGroupAddon align="inline-end">
          <Kbd>{formatForDisplay("Mod+K")}</Kbd>
        </InputGroupAddon>
      </InputGroup>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command
          filter={(value, searchContent, keywords) => {
            if (keywords?.includes("*")) {
              return 1;
            }

            if (value.toLowerCase().includes(searchContent.toLowerCase())) {
              return 1;
            }

            return 0;
          }}
        >
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onInput={(event) => {
              setSearch(event.currentTarget.value);
            }}
          />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Navigation">
              <CommandItem>Games</CommandItem>
              <CommandItem>Platforms</CommandItem>
              <CommandItem>Emulators</CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <GamesSearch />
          </CommandList>
        </Command>
      </CommandDialog>
    </SearchCommandContext.Provider>
  );
}
