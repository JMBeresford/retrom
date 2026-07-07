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
} from "@retrom/ui-next/components/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@retrom/ui-next/components/input-group";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchCommand() {
  const [open, setOpen] = useState(false);

  useHotkey("Mod+K", () => setOpen(true));

  return (
    <>
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
        <Command>
          <CommandInput placeholder="Type a command or search..." />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Navigation">
              <CommandItem>Games</CommandItem>
              <CommandItem>Platforms</CommandItem>
              <CommandItem>Emulators</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
