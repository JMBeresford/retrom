"use client";

import { useCallback, useMemo, useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import {
  NewPlatformMetadata,
  UpdatePlatformMetadataRequest,
  UpdatePlatformMetadataResponse,
} from "@/generated/retrom";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlatformAndMetadata } from ".";

type Props = {
  allIgdbPlatforms: NewPlatformMetadata[];
  currentPlatformMetadata: PlatformAndMetadata[];
  updatePlatformMetadataAction: (
    req: UpdatePlatformMetadataRequest,
  ) => Promise<UpdatePlatformMetadataResponse>;
};

export function MatchPlatformsMenuItem(props: Props) {
  const {
    updatePlatformMetadataAction,
    allIgdbPlatforms,
    currentPlatformMetadata,
  } = props;

  const defaultSelections = useMemo(
    () =>
      currentPlatformMetadata.reduce(
        (acc, platform) => acc.set(platform.id, platform.metadata.igdbId),
        new Map<number, number | undefined>(),
      ),
    [currentPlatformMetadata],
  );
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selections, setSelections] =
    useState<Map<number, number | undefined>>(defaultSelections);
  const [loading, setLoading] = useState(false);

  const allUnchanged = useMemo(() => {
    for (const [platformId, igdbId] of selections.entries()) {
      if (igdbId !== defaultSelections.get(platformId)) {
        return false;
      }
    }

    return true;
  }, [selections, defaultSelections]);

  const handleUpdate = useCallback(() => {
    setLoading(true);
    const req = UpdatePlatformMetadataRequest.create();

    for (const [platformId, igdbId] of selections.entries()) {
      if (!igdbId) {
        continue;
      }

      const igdbMetadata = allIgdbPlatforms.find((p) => p.igdbId === igdbId);

      req.metadata.push({
        platformId,
        ...igdbMetadata,
      });
    }

    updatePlatformMetadataAction(req)
      .then((res) =>
        toast({
          title: "Successfully updated metadta",
          description: `Updated ${res.metadataUpdated.length} metadata entries`,
        }),
      )
      .catch((err) => {
        console.error(err);
        toast({
          title: "Failed to update metadata",
          variant: "destructive",
          description: "Check console for details",
        });
      })
      .finally(() => setLoading(false));
  }, [allIgdbPlatforms, toast, updatePlatformMetadataAction, selections]);

  const findIgdbSelection = useCallback(
    (id?: number) =>
      id ? allIgdbPlatforms.find((p) => p.igdbId === id) : undefined,
    [allIgdbPlatforms],
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Match Platforms
        </MenubarItem>
      </DialogTrigger>

      <DialogOverlay>
        <DialogContent className="max-h-screen">
          <DialogTitle>Match Platforms</DialogTitle>
          Match your platforms to IGDB platforms to get more accurate metadata.
          {currentPlatformMetadata.map((platform) => {
            const selection = selections.get(platform.id);
            const unchanged = defaultSelections.get(platform.id) === selection;

            const relativePath =
              ".../" + (platform.path.split("/").pop() ?? platform.path);

            return (
              <div key={platform.id} className="grid grid-cols-2">
                <code className="relative px-2 border-l border-y bg-muted grid place-items-center">
                  <pre className="h-min w-full text-muted-foreground font-mono text-sm font-semibold">
                    {relativePath}
                  </pre>
                </code>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        (selection === undefined || unchanged) &&
                          "text-muted-foreground",
                        "justify-between z-10",
                      )}
                    >
                      <span>
                        {findIgdbSelection(selection)?.name ??
                          "Select a platform..."}
                        {unchanged && (
                          <span className="text-xs opacity-50">
                            {" (unchanged)"}
                          </span>
                        )}
                      </span>

                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search platforms..." />
                      <CommandList>
                        <CommandGroup>
                          {allIgdbPlatforms.map((igdbPlatform) => (
                            <CommandItem
                              key={igdbPlatform.igdbId}
                              value={igdbPlatform.name}
                              onSelect={() => {
                                setSelections(
                                  (prev) =>
                                    new Map(
                                      prev.set(
                                        platform.id,
                                        igdbPlatform.igdbId,
                                      ),
                                    ),
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selection === igdbPlatform.igdbId
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div>
                                {igdbPlatform.name}
                                {igdbPlatform.igdbId ===
                                  defaultSelections.get(platform.id) && (
                                  <span className="text-xs opacity-50">
                                    {" (current)"}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
          <DialogFooter>
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>

              <Button
                disabled={loading || allUnchanged}
                className="relative"
                onClick={() => handleUpdate()}
              >
                <LoaderIcon
                  className={cn(
                    "animate-spin absolute",
                    !loading && "opacity-0",
                  )}
                />
                <p>Update</p>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
