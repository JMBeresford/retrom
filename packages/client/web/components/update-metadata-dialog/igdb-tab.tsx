"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Game,
  GameMetadata,
  IgdbGameSearchQuery,
  Platform,
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
import { cn } from "@/lib/utils";
import { DialogFooter } from "../ui/dialog";

type Props = {
  game: Game;
  currentMetadata?: GameMetadata;
  platform?: Platform;
  searchHandler: (query: IgdbGameSearchQuery) => Promise<Array<GameMetadata>>;
  updateHandler: (metadata: GameMetadata) => Promise<void>;
};

const emptyToUndefined = z.literal("").transform(() => undefined);
function asOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(emptyToUndefined);
}

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  search: z.string().min(1).max(50),
  igdbId: asOptional(z.string().min(1).max(20)),
  // platform: asOptional(z.string().min(1).max(50)),
});

export function IgdbTab(props: Props) {
  const { game, currentMetadata, searchHandler, updateHandler } = props;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: currentMetadata?.name ?? "",
      igdbId: "",
    },
  });
  const [matches, setMatches] = useState<Array<GameMetadata>>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>();

  const handleSearch = useCallback(
    (values: FormSchema) => {
      const { search, igdbId } = values;

      const igdbIdNum = igdbId !== undefined ? parseInt(igdbId) : undefined;

      setLoading(true);
      searchHandler({ search, igdbId: igdbIdNum, gameId: game.id })
        .then((matches) => {
          setMatches(matches);
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
    [game, searchHandler, toast],
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
    updateHandler(match)
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
  }, [matches, toast, updateHandler, selectedMatch]);

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
