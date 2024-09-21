import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetIgdbGameSearchResultsRequest } from "@/generated/retrom/services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useCallback, useState } from "react";
import { Button } from "../../ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { useToast } from "../../ui/use-toast";
import { Separator } from "../../ui/separator";
import { LoaderCircleIcon } from "lucide-react";
import { cn, getFileStub } from "@/lib/utils";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "../../ui/checkbox";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";
import { useUpdateGames } from "@/mutations/useUpdateGames";
import { useGameDetail } from "@/providers/game-details";

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  search: z.string().max(255),
  igdbId: z.coerce.number().optional(),
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
  const retromClient = useRetromClient();

  const [searchRequest, setSearchRequest] =
    useState<GetIgdbGameSearchResultsRequest>({
      query: {
        search: {
          value: currentMetadata?.name ?? "",
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
      return await retromClient.metadataClient.getIgdbGameSearchResults(
        searchRequest,
      );
    },
    select: (data) => data.metadata,
  });

  const { mutate: updateGames } = useUpdateGames();
  const { mutateAsync: updateMetadata, isPending: updatePending } =
    useUpdateGameMetadata();

  const loading = searchPending || updatePending;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: currentMetadata?.name ?? "",
      igdbId: currentMetadata?.igdbId,
    },
  });

  const handleSearch = useCallback(
    (values: FormSchema) => {
      const { search, igdbId } = values;
      console.log({ igdbId });

      if (!game) {
        return;
      }

      const platform = platformMetadata?.igdbId;

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

    const match = matches.find((m) => m.igdbId?.toString() === selectedMatch);

    if (!match) {
      toast({
        title: "Error updating metadata",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await updateMetadata({
        metadata: [{ ...match, gameId: game.id }],
      });

      if (renameDirectory) {
        const newName = res.metadataUpdated[0]?.name;
        const currentFilename = getFileStub(game.path);

        if (!newName || !currentFilename) {
          throw new Error("Failed to update metadata");
        }

        const path = game.path.replace(currentFilename, newName);

        updateGames({
          games: [{ id: game.id, path }],
        });
      }
    } catch {
      toast({
        title: "Error updating metadata",
        description: "Something went wrong, please try again",
        variant: "destructive",
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IGDB ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit">
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
                matches && matches.length < 1
                  ? "Search for a game"
                  : "Select a matching game"
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
        <div className="flex items-center justify-between gap-6 w-full mt-4">
          <div className="flex items-top gap-2">
            <Checkbox
              id="rename-directory"
              checked={renameDirectory}
              onCheckedChange={(event) => setRenameDirectory(!!event)}
            />

            <div className="grid gap-1 5 leading-none">
              <label htmlFor="rename-directory">Rename Directory</label>

              <p className="text-sm text-muted-foreground">
                This will alter the file system
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button disabled={loading} variant="secondary">
                Cancel
              </Button>
            </DialogClose>

            <Button
              onClick={() => handleUpdate()}
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
