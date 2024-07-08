"use client";

import { useCallback, useMemo, useState } from "react";
import { MenubarItem } from "@/components/ui/menubar";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { LoaderCircleIcon, LoaderIcon } from "lucide-react";
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
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Platform, PlatformMetadata } from "@/generated/retrom/models";
import {
  GetIgdbSearchRequest_IgdbSearchType,
  UpdatePlatformMetadataRequest,
} from "@/generated/retrom/services";
import { usePlatforms } from "@/queries/usePlatforms";

export type PlatformAndMetadata = Platform & { metadata: PlatformMetadata };

export function MatchPlatformsMenuItem() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

  const { data: allIgdbPlatforms, status: igdbSearchStatus } = useQuery({
    queryKey: ["igdb-search"],
    queryFn: async () =>
      await retromClient.metadataClient.getIgdbSearch({
        searchType: GetIgdbSearchRequest_IgdbSearchType.PLATFORM,
        fields: {
          selector: {
            $case: "include",
            include: { value: ["id", "name", "summary"] },
          },
        },

        // 500 is the maximum limit for the IGDB API, default is 10
        pagination: { limit: 500 },
      }),
    select: (res) => {
      if (res.searchResults?.$case === "platformMatches") {
        return res.searchResults.platformMatches.platforms;
      }

      console.error("Wrong enum encountered in oneOf type");

      toast({
        title: "Failed to fetch IGDB platforms",
        variant: "destructive",
        description: "Check console for details",
      });

      redirect("/500");
    },
  });

  const { data: platformData, status: platformStatus } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) => {
      const platforms = data.platforms;
      const metadata = data.metadata;

      const platformsWithMetadata: PlatformAndMetadata[] = [];
      for (const platform of platforms) {
        const platformMetadata = metadata.find(
          (m) => m.platformId === platform.id,
        );

        platformsWithMetadata.push({
          ...platform,
          metadata: platformMetadata ?? PlatformMetadata.create(),
        });
      }

      return platformsWithMetadata;
    },
  });

  const { mutate, isPending } = useMutation({
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error updating metadata",
        description: "Check the console for details",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["platforms", "platform-metadata"].some((key) =>
            query.queryKey.includes(key),
          ),
      });

      toast({
        title: "Successfully updated metadata",
        description: "Updated metadata entries",
      });
    },
    mutationFn: async (req: UpdatePlatformMetadataRequest) =>
      await retromClient.metadataClient.updatePlatformMetadata(req),
  });

  const defaultSelections = useMemo(() => {
    const map = new Map<number, number | undefined>();
    platformData?.forEach((platform) =>
      map.set(platform.id, platform.metadata.igdbId),
    );

    return map;
  }, [platformData]);

  const error = igdbSearchStatus === "error" || platformStatus === "error";

  const loading =
    isPending || igdbSearchStatus === "pending" || platformStatus === "pending";

  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selections, setSelections] = useState<Map<number, number | undefined>>(
    new Map(defaultSelections),
  );

  const allUnchanged = useMemo(() => {
    for (const [platformId, igdbId] of selections.entries()) {
      if (igdbId !== defaultSelections.get(platformId)) {
        return false;
      }
    }

    return true;
  }, [selections, defaultSelections]);

  const handleUpdate = useCallback(() => {
    const req = UpdatePlatformMetadataRequest.create();

    for (const [platformId, igdbId] of selections.entries()) {
      const igdbMetadata = allIgdbPlatforms?.find((p) => p.igdbId === igdbId);

      if (!igdbId || !igdbMetadata) {
        continue;
      }

      req.metadata.push({
        ...igdbMetadata,
        platformId,
      });
    }

    console.log({ req });

    mutate(req);
    setDialogOpen(false);
  }, [allIgdbPlatforms, selections, mutate]);

  const findIgdbSelection = useCallback(
    (id?: number) =>
      id ? allIgdbPlatforms?.find((p) => p.igdbId === id) : undefined,
    [allIgdbPlatforms],
  );

  if (error) {
    redirect("/500");
  }

  if (loading) {
    return (
      <MenubarItem className="text-muted-foreground/50 pointer-events-none touch-none flex gap-2">
        <LoaderCircleIcon className="animate-spin" /> Match Platforms
      </MenubarItem>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Match Platforms
        </MenubarItem>
      </DialogTrigger>

      <DialogOverlay>
        <DialogContent>
          <DialogHeader className="mb-4">
            <DialogTitle>Match Platforms</DialogTitle>
            <DialogDescription>
              Match your platforms to IGDB platforms to get more accurate
              metadata.
            </DialogDescription>
          </DialogHeader>

          {platformData.map((platform) => {
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
