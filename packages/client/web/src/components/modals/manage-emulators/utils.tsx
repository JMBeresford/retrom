import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Emulator_OperatingSystem,
  SaveStrategy,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { PlatformWithMetadata } from ".";
import { cn, getFileStub } from "@/lib/utils";
import { Check } from "lucide-react";

export const saveStrategyDisplayMap: Record<SaveStrategy, string> = {
  [SaveStrategy.SINGLE_FILE]: "Single File",
  [SaveStrategy.FILE_SYSTEM_DIRECTORY]: "File System Directory",
  [SaveStrategy.DISK_IMAGE]: "Disk Image",
};

export const operatingSystemDisplayMap: Record<
  Emulator_OperatingSystem,
  string
> = {
  [Emulator_OperatingSystem.WINDOWS]: "Windows",
  [Emulator_OperatingSystem.MACOS]: "macOS",
  [Emulator_OperatingSystem.LINUX_x86_64]: "Linux",
  [Emulator_OperatingSystem.WASM]: "Web",
};

export function PlatformsDropdown(props: {
  platforms: PlatformWithMetadata[];
  onChange?: (id: number) => void;
  selections: number[];
}) {
  const { platforms, onChange, selections } = props;

  function sortBySelection(a: PlatformWithMetadata, b: PlatformWithMetadata) {
    const aSelected = selections.includes(a.id);
    const bSelected = selections.includes(b.id);
    const aName = a.metadata?.name ?? getFileStub(a.path) ?? "";
    const bName = b.metadata?.name ?? getFileStub(b.path) ?? "";

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    return aName.localeCompare(bName);
  }

  return (
    <Command>
      <CommandInput placeholder="Search platforms" />
      <CommandList>
        <CommandGroup>
          {platforms?.sort(sortBySelection).map((platform) => {
            const name = platform.metadata?.name ?? getFileStub(platform.path);

            return (
              <CommandItem
                className="cursor-pointer"
                key={platform.id}
                value={name}
                onSelect={() => onChange && onChange(platform.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selections.includes(platform.id)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {name}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
