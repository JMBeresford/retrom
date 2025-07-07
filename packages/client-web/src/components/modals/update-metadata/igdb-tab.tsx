import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetIgdbGameSearchResultsRequest } from "@retrom/codegen/retrom/services/metadata-service_pb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@retrom/ui/components/select";
import { useCallback, useState } from "react";
import { Button } from "@retrom/ui/components/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@retrom/ui/components/form";
import { Input } from "@retrom/ui/components/input";
import { useToast } from "@retrom/ui/hooks/use-toast";
import { Separator } from "@retrom/ui/components/separator";
import { LoaderCircleIcon } from "lucide-react";
import { getFileStub } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { DialogClose, DialogFooter } from "@retrom/ui/components/dialog";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@retrom/ui/components/checkbox";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";
import { useUpdateGames } from "@/mutations/useUpdateGames";
import { useGameDetail } from "@/providers/game-details";
import { useNavigate } from "@tanstack/react-router";
import { RawMessage } from "@/utils/protos";
import { create } from "@bufbuild/protobuf";
import { UpdatedGameMetadataSchema } from "@retrom/codegen/retrom/models/metadata_pb";

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z
  .object({
    search: z.string().max(255),
    igdbId: z.coerce.bigint().optional(),
    restrictToCurrentPlatform: z.boolean(),
  })
  .refine((data) => data.igdbId || data.search, {
    message: "You must provide either a search term or an IGDB ID",
  });

export function IgdbTab() {
  const {
    game,
    gameMetadata: currentMetadata,
    platformMetadata,
  } = useGameDetail();

  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>();
  const [renameDirectory, setRenameDirectory] = useState(false);
  const navigate = useNavigate();
  const retromClient = useRetromClient();

  const [searchRequest, setSearchRequest] = useState<
    RawMessage<GetIgdbGameSearchResultsRequest>
  >({
    query: {
      search: {
        value: currentMetadata?.name ?? getFileStub(game.path),
      },
      gameId: game.id,
      fields: {
        platform: platformMetadata?.igdbId,
        id: currentMetadata?.igdbId,
      },
    },
  });

  const { data: matches, isPending: searchPending } = useQuery({
    enabled: !!searchRequest,
    queryKey: ["games", "igdb-search", searchRequest],
    queryFn: async () => {
      if (
        !searchRequest.query?.search?.value &&
        !searchRequest.query?.fields?.id
      ) {
        return null;
      }

      return await retromClient.metadataClient.getIgdbGameSearchResults(
        searchRequest,
      );
    },
    select: (data) => data?.metadata ?? [],
  });

  const { mutateAsync: updateGames } = useUpdateGames();
  const { mutateAsync: updateMetadata, isPending: updatePending } =
    useUpdateGameMetadata();

  const loading = searchPending || updatePending;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: currentMetadata?.name ?? getFileStub(game.path),
      igdbId: currentMetadata?.igdbId,
      restrictToCurrentPlatform: platformMetadata?.igdbId !== undefined,
    },
  });

  const handleSearch = useCallback(
    (values: FormSchema) => {
      const { search, igdbId, restrictToCurrentPlatform } = values;

      if (!game) {
        return;
      }

      const platform = restrictToCurrentPlatform
        ? platformMetadata?.igdbId
        : undefined;

      setSearchRequest({
        query: {
          search: {
            value: search,
          },
          fields: {
            id: igdbId,
            platform,
          },
          gameId: game.id,
        },
      });
    },
    [game, platformMetadata],
  );

  const handleUpdate = useCallback(async () => {
    if (!selectedMatch || !matches) {
      return;
    }

    const matchMessage = matches.find(
      (m) => m.igdbId?.toString() === selectedMatch,
    );

    if (!matchMessage) {
      toast({
        title: "Error updating metadata",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
      return;
    }

    const { $typeName: _, ...match } = matchMessage;

    try {
      const res = await updateMetadata({
        metadata: [
          create(UpdatedGameMetadataSchema, { ...match, gameId: game.id }),
        ],
      });

      if (renameDirectory) {
        const newName = res.metadataUpdated[0]?.name;
        const currentFilename = getFileStub(game.path);

        if (!newName || !currentFilename) {
          throw new Error("Failed to update metadata");
        }

        const path = game.path.replace(currentFilename, newName);

        await updateGames({
          games: [{ id: game.id, path }],
        });
      }
    } catch {
      toast({
        title: "Error updating metadata",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
    } finally {
      void navigate({
        to: ".",
        search: (prev) => ({ ...prev, updateMetadataModal: undefined }),
      });
    }
  }, [
    matches,
    selectedMatch,
    game,
    toast,
    updateMetadata,
    renameDirectory,
    updateGames,
    navigate,
  ]);

  return (
    <>
      <div className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSearch)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus={true} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="igdbId"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>IGDB ID</FormLabel>
                  <FormControl>
                    <Input {...field} value={value?.toString()} />
                  </FormControl>
                </FormItem>
              )}
            />

            {platformMetadata?.igdbId !== undefined ? (
              <FormField
                control={form.control}
                name="restrictToCurrentPlatform"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="grid gap-1">
                      <FormLabel className="font-normal text-foreground text-base leading-none">
                        Restrict to currently matched IGDB platform
                      </FormLabel>
                      <FormDescription className="max-w-[50ch]">
                        This will only search the games for{" "}
                        <strong>({platformMetadata?.name})</strong>
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            ) : (
              <></>
            )}

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              <LoaderCircleIcon
                className={cn("animate-spin absolute", !loading && "opacity-0")}
              />
              <p className={cn(loading && "opacity-0")}>Search IGDB</p>
            </Button>
          </form>
        </Form>

        <Separator />

        <Select
          disabled={!matches?.length}
          value={selectedMatch}
          onValueChange={setSelectedMatch}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                <span className="text-muted-foreground italic">
                  {matches && matches.length < 1
                    ? "Search for a game..."
                    : "Select a matching IGDB game..."}
                </span>
              }
            />
          </SelectTrigger>

          <SelectContent>
            {matches?.map((match, i) => (
              <SelectItem
                key={`${match.gameId}-${i}`}
                value={match.igdbId?.toString() ?? i.toString()}
              >
                {match.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between",
            "gap-6 w-full mt-4",
          )}
        >
          <div className="flex items-top gap-2">
            <Checkbox
              id="rename-directory"
              checked={renameDirectory}
              onCheckedChange={(event) => setRenameDirectory(!!event)}
            />

            <div className="grid gap-1 leading-none">
              <label htmlFor="rename-directory">Rename Directory</label>

              <p className="text-sm text-muted-foreground">
                This will alter the file system
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <DialogClose asChild>
              <Button disabled={loading} variant="secondary">
                Cancel
              </Button>
            </DialogClose>

            <Button
              onClick={handleUpdate}
              disabled={selectedMatch === undefined || loading}
            >
              <LoaderCircleIcon
                className={cn("animate-spin absolute", !loading && "opacity-0")}
              />
              <p className={cn(loading && "opacity-0")}>Update Metadata</p>
            </Button>
          </div>
        </div>
      </DialogFooter>
    </>
  );
}
