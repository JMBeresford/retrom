import { useCallback, useMemo, useState } from "react";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { cn, getFileName, getFileStub } from "@/lib/utils";
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
import {
  Platform,
  UpdatedPlatform,
} from "@retrom/codegen/retrom/models/platforms_pb";
import {
  GetIgdbSearchRequest_IgdbSearchType,
  UpdatePlatformMetadataRequest,
  UpdatePlatformMetadataRequestSchema,
} from "@retrom/codegen/retrom/services_pb";
import { usePlatforms } from "@/queries/usePlatforms";
import {
  PlatformMetadata,
  PlatformMetadataSchema,
} from "@retrom/codegen/retrom/models/metadata_pb";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdatePlatforms } from "@/mutations/useUpdatePlatforms";
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { create } from "@bufbuild/protobuf";

export type PlatformAndMetadata = Platform & { metadata: PlatformMetadata };

export function MatchPlatformsModal() {
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { matchPlatformsModal } = RootRoute.useSearch();

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
    },
  });

  const { data: platformData, status: platformStatus } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) => {
      const platforms = data.platforms.filter(
        (platform) => !platform.thirdParty,
      );
      const metadata = data.metadata;

      const platformsWithMetadata: PlatformAndMetadata[] = [];
      for (const platform of platforms) {
        const platformMetadata = metadata.find(
          (m) => m.platformId === platform.id,
        );

        platformsWithMetadata.push({
          ...platform,
          metadata: platformMetadata ?? create(PlatformMetadataSchema, {}),
        });
      }

      return platformsWithMetadata;
    },
  });

  const { mutateAsync: updatePlatforms } = useUpdatePlatforms();

  const { mutateAsync: updateMetadata, isPending: metadataPending } =
    useMutation({
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error updating metadata",
          description: "Check the console for details",
          variant: "destructive",
        });
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({
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
    metadataPending ||
    igdbSearchStatus === "pending" ||
    platformStatus === "pending";

  const { toast } = useToast();
  const [renameDirectories, setRenameDirectories] = useState(false);
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

  const close = useCallback(() => {
    return navigate({
      search: (prev) => ({ ...prev, matchPlatformsModal: undefined }),
    });
  }, [navigate]);

  const handleUpdate = useCallback(async () => {
    const req = create(UpdatePlatformMetadataRequestSchema, {});

    for (const [platformId, igdbId] of selections.entries()) {
      const defaultSelection = defaultSelections.get(platformId);

      if (igdbId === defaultSelection) {
        continue;
      }

      const igdbMetadata = allIgdbPlatforms?.find((p) => p.igdbId === igdbId);

      if (!igdbId || !igdbMetadata) {
        continue;
      }

      req.metadata.push({
        ...igdbMetadata,
        platformId,
      });
    }

    const res = await updateMetadata(req);

    if (renameDirectories) {
      const updatedPlatforms: UpdatedPlatform[] = res.metadataUpdated.flatMap(
        (meta) => {
          const platform = platformData?.find((p) => p.id === meta.platformId);

          if (!platform || !meta.name) return [];

          const currentFilename = getFileName(platform.path);
          const path = platform.path.replace(currentFilename, meta.name);

          return [
            {
              id: platform.id,
              path,
            },
          ];
        },
      );

      try {
        await updatePlatforms({ platforms: updatedPlatforms });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error renaming directories",
          description: "Check the console for details",
          variant: "destructive",
        });
      }

      return close();
    }
  }, [
    allIgdbPlatforms,
    defaultSelections,
    selections,
    updateMetadata,
    renameDirectories,
    toast,
    platformData,
    updatePlatforms,
    close,
  ]);

  const findIgdbSelection = useCallback(
    (id?: number) =>
      id ? allIgdbPlatforms?.find((p) => p.igdbId === id) : undefined,
    [allIgdbPlatforms],
  );

  return (
    <Dialog
      open={matchPlatformsModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void close();
        }
      }}
    >
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Match Platforms</DialogTitle>
          <DialogDescription>
            Match your platforms to IGDB platforms to get more accurate
            metadata.
          </DialogDescription>
        </DialogHeader>

        <div>
          {allIgdbPlatforms?.length === 0 ? (
            <div className="flex mb-4 text-destructive-text items-center gap-1">
              <AlertCircleIcon className="h-4 w-4" />
              <p className="text-sm leading-none">
                No IGDB platform results found. Have you configured your IGDB
                credentials yet?
              </p>
            </div>
          ) : null}

          {loading ? <LoaderCircleIcon className="animate-spin" /> : null}
          {error ? <AlertCircleIcon className="text-destructive-text" /> : null}
          <Table>
            <TableHeader className="hidden sm:table-header-group">
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>IGDB Platform</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {platformData?.map((platform) => {
                const selection =
                  selections.get(platform.id) ||
                  defaultSelections.get(platform.id);

                const unchanged =
                  defaultSelections.get(platform.id) === selection;

                const platformName =
                  platform.metadata.name ?? getFileStub(platform.path);

                return (
                  <TableRow
                    key={platform.id}
                    className="py-0 flex flex-col mb-2 sm:mb-0 sm:table-row"
                  >
                    <TableCell className="py-0">{platformName}</TableCell>

                    <Popover modal={true}>
                      <TableCell className="py-0 p-0">
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            role="combobox"
                            className={cn(
                              (selection === undefined || unchanged) &&
                                "text-muted-foreground",
                              "justify-between z-10 w-full",
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
                      </TableCell>

                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search platforms..." />
                          <CommandList>
                            <CommandGroup>
                              {allIgdbPlatforms?.map((igdbPlatform) => (
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <div className="flex flex-col sm:flex-row justify-between gap-6 sm:mt-4 sm:pr-4 w-full">
            <div className="flex items-top gap-2">
              <Checkbox
                id="rename-directories"
                checked={renameDirectories}
                onCheckedChange={(event) => setRenameDirectories(!!event)}
              />

              <div className="grid gap-1 5 leading-none">
                <label htmlFor="rename-directories">Rename Directories</label>

                <p className="text-sm text-muted-foreground">
                  This will alter the file system
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:items-top">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>

              <Button
                disabled={loading || allUnchanged}
                className="relative"
                onClick={handleUpdate}
              >
                <LoaderCircleIcon
                  className={cn(
                    "animate-spin absolute",
                    !loading && "opacity-0",
                  )}
                />
                <p>Update</p>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
