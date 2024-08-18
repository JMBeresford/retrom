"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GetIgdbGameSearchResultsRequest,
  type UpdateGameMetadataRequest,
} from "@/generated/retrom/services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Separator } from "../ui/separator";
import { LoaderCircleIcon } from "lucide-react";
import { asOptionalString, cn } from "@/lib/utils";
import { DialogFooter } from "../ui/dialog";
import { useGameDetail } from "@/app/games/[id]/game-details-context";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdatedGameMetadata } from "@/generated/retrom/models/metadata";

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  search: z.string().min(1).max(255),
  igdbId: asOptionalString(z.string().min(1).max(20)),
});

export function IgdbTab() {
  const {
    game,
    gameMetadata: currentMetadata,
    platformMetadata,
  } = useGameDetail();

  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>();
  const retromClient = useRetromClient();
  const queryClient = useQueryClient();

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

  const { mutate, isPending: updatePending } = useMutation({
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
          ["games", "game-metadata", game.id].some((key) =>
            query.queryKey.includes(key),
          ),
      });

      toast({
        title: "Metadata updated",
        description: "Game metadata has been updated successfully",
      });
    },
    mutationFn: async (req: UpdateGameMetadataRequest) => {
      return await retromClient.metadataClient.updateGameMetadata(req);
    },
  });

  const loading = searchPending || updatePending;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: currentMetadata?.name ?? "",
      igdbId: currentMetadata?.igdbId?.toString() ?? undefined,
    },
  });

  const handleSearch = useCallback(
    (values: FormSchema) => {
      const { search, igdbId } = values;

      if (!game) {
        return;
      }

      const igdbIdNum = igdbId !== undefined ? parseInt(igdbId) : undefined;
      const platform = platformMetadata?.igdbId;

      setSearchRequest({
        query: {
          search: {
            value: search,
          },
          fields: {
            id: igdbIdNum,
            platform,
          },
          gameId: game.id,
        },
      });
    },
    [game, platformMetadata],
  );

  const handleUpdate = useCallback(() => {
    if (!selectedMatch || !matches) {
      return;
    }

    const match = matches.find((m) => m.igdbId === parseInt(selectedMatch));

    if (!match) {
      toast({
        title: "Error updating metadata",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
      return;
    }

    mutate({
      metadata: [UpdatedGameMetadata.create({ ...match, gameId: game.id })],
    });
  }, [matches, selectedMatch, game, mutate, toast]);

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
                    <Input {...field} />
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
        <Button
          className="mt-4"
          onClick={() => handleUpdate()}
          disabled={selectedMatch === undefined}
        >
          <LoaderCircleIcon
            className={cn("animate-spin absolute", !loading && "opacity-0")}
          />
          <p className={cn(loading && "opacity-0")}>Update Metadata</p>
        </Button>
      </DialogFooter>
    </>
  );
}
