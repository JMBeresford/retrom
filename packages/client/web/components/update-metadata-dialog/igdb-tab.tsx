"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdatedGameMetadata,
  type GetIgdbGameSearchResultsRequest,
  type GetIgdbGameSearchResultsResponse,
  type NewGameMetadata,
  type UpdateGameMetadataRequest,
  type UpdateGameMetadataResponse,
} from "@/generated/retrom";
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
import { LoaderIcon } from "lucide-react";
import { asOptionalString, cn } from "@/lib/utils";
import { DialogFooter } from "../ui/dialog";
import { useGameDetail } from "@/app/games/[id]/game-context";

type Props = {
  searchHandler: (
    req: Partial<GetIgdbGameSearchResultsRequest>,
  ) => Promise<GetIgdbGameSearchResultsResponse>;
  updateHandler: (
    req: Partial<UpdateGameMetadataRequest>,
  ) => Promise<UpdateGameMetadataResponse>;
};

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  search: z.string().min(1).max(50),
  igdbId: asOptionalString(z.string().min(1).max(20)),
});

export function IgdbTab(props: Props) {
  const {
    game,
    gameMetadata: currentMetadata,
    platformMetadata,
  } = useGameDetail();
  const { searchHandler, updateHandler } = props;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: currentMetadata?.name ?? "",
      igdbId: "",
    },
  });
  const [matches, setMatches] = useState<Array<NewGameMetadata>>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>();

  const handleSearch = useCallback(
    (values: FormSchema) => {
      const { search, igdbId } = values;

      const igdbIdNum = igdbId !== undefined ? parseInt(igdbId) : undefined;

      setLoading(true);
      searchHandler({
        query: {
          search: { value: search },
          fields: {
            id: igdbIdNum,
            platform: platformMetadata?.igdbId,
          },
          gameId: game.id,
        },
      })
        .then(({ metadata }) => {
          setMatches(metadata);
        })
        .catch((error) => {
          console.error(error);
          toast({
            title: "Failed to search IGDB",
            description: "Check the console for details",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [game, searchHandler, toast, platformMetadata],
  );

  const handleUpdate = useCallback(() => {
    if (!selectedMatch) {
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

    setLoading(true);
    updateHandler({
      metadata: [UpdatedGameMetadata.create({ ...match, gameId: game.id })],
    })
      .then(() => {
        toast({
          title: "Metadata updated",
          description: "Metadata has been updated successfully",
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Error updating metadata",
          description: "Check the console for details",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [matches, toast, updateHandler, selectedMatch, game]);

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
              <LoaderIcon
                className={cn("animate-spin absolute", !loading && "opacity-0")}
              />
              <p className={cn(loading && "opacity-0")}>Search IGDB</p>
            </Button>
          </form>
        </Form>

        <Separator />

        <Select
          disabled={matches.length < 1}
          value={selectedMatch}
          onValueChange={setSelectedMatch}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                matches.length < 1
                  ? "Search for a game"
                  : "Select a matching game"
              }
            />
          </SelectTrigger>

          <SelectContent>
            {matches.map((match, i) => (
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
          <LoaderIcon
            className={cn("animate-spin absolute", !loading && "opacity-0")}
          />
          <p className={cn(loading && "opacity-0")}>Update Metadata</p>
        </Button>
      </DialogFooter>
    </>
  );
}
