import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Button } from "@retrom/ui/components/button";
import { UseFormReturn, useForm } from "@retrom/ui/components/form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@retrom/ui/components/form";
import { Input } from "@retrom/ui/components/input";
import { LoaderCircleIcon } from "lucide-react";
import { getFileName, InferSchema } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { DialogClose, DialogFooter } from "@retrom/ui/components/dialog";
import { Textarea } from "@retrom/ui/components/textarea";
import { GameMetadata } from "@retrom/codegen/retrom/models/metadata_pb";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";
import { Checkbox } from "@retrom/ui/components/checkbox";
import { useUpdateGames } from "@/mutations/useUpdateGames";
import { useGameDetail } from "@/providers/game-details";
import { useNavigate } from "@tanstack/react-router";
import { StorageType } from "@retrom/codegen/retrom/server/config_pb";
import { RawMessage } from "@/utils/protos";

type FormFieldRenderer = ({
  form,
}: {
  form: UseFormReturn<FormSchema>;
}) => JSX.Element;

type EditableGameMetadata = Omit<
  GameMetadata,
  | "gameId"
  | "igdbId"
  | "steamId"
  | "createdAt"
  | "updatedAt"
  | "releaseDate"
  | "lastPlayed"
  | "minutesPlayed"
  | "links"
  | "videoUrls"
  | "artworkUrls"
  | "screenshotUrls"
>;
type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  description: z.string().optional(),
  coverUrl: z
    .literal("")
    .or(z.string().url({ message: "Icon URL must be a valid URL" })),

  backgroundUrl: z
    .literal("")
    .or(z.string().url({ message: "Icon URL must be a valid URL" })),

  iconUrl: z
    .literal("")
    .or(z.string().url({ message: "Icon URL must be a valid URL" })),

  // links: z.array(z.string().url({ message: "Link must be a valid URL" })),
  // videoUrls: z.array(
  //   z.string().url({ message: "Video URL must be a valid URL" }),
  // ),
  // artworkUrls: z.array(
  //   z.string().url({ message: "Artwork URL must be a valid URL" }),
  // ),
  // screenshotUrls: z.array(
  //   z.string().url({ message: "Screenshot URL must be a valid URL" }),
  // ),
}) satisfies InferSchema<RawMessage<EditableGameMetadata>>;

export function ManualTab() {
  const { game, gameMetadata } = useGameDetail();
  const navigate = useNavigate();
  const [renameDirectory, setRenameDirectory] = useState(false);

  const { mutateAsync: updateMetadata, status: metadataStatus } =
    useUpdateGameMetadata();

  const { mutateAsync: updateGames, status: gameStatus } = useUpdateGames();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: gameMetadata?.name ?? "",
      description: gameMetadata?.description ?? "",
      coverUrl: gameMetadata?.coverUrl ?? "",
      backgroundUrl: gameMetadata?.backgroundUrl ?? "",
      iconUrl: gameMetadata?.iconUrl ?? "",
      // links: gameMetadata?.links ?? [],
      // videoUrls: gameMetadata?.videoUrls ?? [],
      // artworkUrls: gameMetadata?.artworkUrls ?? [],
      // screenshotUrls: gameMetadata?.screenshotUrls ?? [],
    },
  });

  const handleUpdate = useCallback(
    async (values: FormSchema) => {
      const { ...restValues } = values;
      const {
        links = [],
        videoUrls = [],
        artworkUrls = [],
        screenshotUrls = [],
      } = gameMetadata ?? {};

      const updated = {
        links,
        videoUrls,
        artworkUrls,
        screenshotUrls,
        ...restValues,
        gameId: game.id,
      };

      const res = await updateMetadata({ metadata: [updated] });

      if (renameDirectory) {
        const newName = res.metadataUpdated[0]?.name;

        if (newName) {
          const currentFilename = getFileName(game.path);
          const path = game.path.replace(currentFilename, newName);

          await updateGames({
            games: [{ id: game.id, path }],
          });
        }
      }

      form.reset(updated);

      return navigate({
        to: ".",
        search: (prev) => ({ ...prev, updateMetadataModal: undefined }),
      });
    },
    [
      game.id,
      form,
      updateMetadata,
      gameMetadata,
      updateGames,
      renameDirectory,
      game.path,
      navigate,
    ],
  );

  const pending = metadataStatus === "pending" || gameStatus === "pending";
  const isDirty = form.formState.isDirty;

  return (
    <>
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <div className="my-4 flex flex-col gap-4 pb-8">
              {Object.entries(fields).map(([key, FormFieldRenderer]) => (
                <FormFieldRenderer form={form} key={key} />
              ))}
            </div>

            <DialogFooter>
              <div
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center",
                  "justify-between gap-6 w-full sm:mt-4",
                )}
              >
                <div className="flex items-top gap-2">
                  <Checkbox
                    id="rename-directory"
                    disabled={game.thirdParty}
                    checked={renameDirectory}
                    onCheckedChange={(event) => setRenameDirectory(!!event)}
                  />

                  <div
                    className={cn(
                      "grid gap-1 5 leading-none",
                      game.thirdParty && "opacity-50",
                    )}
                  >
                    <label htmlFor="rename-directory">
                      {game.storageType === StorageType.MULTI_FILE_GAME
                        ? "Rename Directory"
                        : "Rename File"}
                    </label>

                    <p className="text-sm text-muted-foreground">
                      This will alter the file system
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2">
                  <DialogClose asChild>
                    <Button disabled={pending} variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button type="submit" disabled={!isDirty || pending}>
                    <LoaderCircleIcon
                      className={cn(
                        "animate-spin absolute",
                        !pending && "opacity-0",
                      )}
                    />
                    <p className={cn(pending && "opacity-0")}>Confirm</p>
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </>
  );
}

const fields: Record<
  keyof RawMessage<EditableGameMetadata>,
  FormFieldRenderer
> = {
  name: ({ form }) => (
    <FormField
      name="name"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem className="col-span-2">
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input
              {...field}
              className={cn(
                fieldState.isDirty ? "text-unset" : "text-muted-foreground",
                "transition-colors",
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ),
  description: ({ form }) => (
    <FormField
      name="description"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem className="col-span-2">
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              className={cn(
                fieldState.isDirty ? "text-unset" : "text-muted-foreground",
                "transition-colors",
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ),
  coverUrl: ({ form }) => (
    <FormField
      name="coverUrl"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Cover Image URL</FormLabel>
          <FormControl>
            <Input
              {...field}
              className={cn(
                fieldState.isDirty ? "text-unset" : "text-muted-foreground",
                "transition-colors",
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ),
  backgroundUrl: ({ form }) => (
    <FormField
      name="backgroundUrl"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Background Image URL</FormLabel>
          <FormControl>
            <Input
              {...field}
              className={cn(
                fieldState.isDirty ? "text-unset" : "text-muted-foreground",
                "transition-colors",
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ),
  iconUrl: ({ form }) => (
    <FormField
      name="iconUrl"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Icon Image URL</FormLabel>
          <FormControl>
            <Input
              {...field}
              className={cn(
                fieldState.isDirty ? "text-unset" : "text-muted-foreground",
                "transition-colors",
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ),
  // links: ({ form }) => (
  //   <FormField
  //     name="links"
  //     disabled
  //     control={form.control}
  //     render={({ field, fieldState }) => (
  //       <FormItem>
  //         <FormLabel>Links</FormLabel>
  //         <FormControl>
  //           <Input
  //             {...field}
  //             className={cn(
  //               fieldState.isDirty ? "text-unset" : "text-muted-foreground",
  //               "transition-colors",
  //             )}
  //           />
  //         </FormControl>
  //         <FormMessage />
  //       </FormItem>
  //     )}
  //   />
  // ),
  // screenshotUrls: ({ form }) => (
  //   <FormField
  //     name="screenshotUrls"
  //     disabled
  //     control={form.control}
  //     render={({ field, fieldState }) => (
  //       <FormItem>
  //         <FormLabel>Screenshots</FormLabel>
  //         <FormControl>
  //           <Input
  //             {...field}
  //             className={cn(
  //               fieldState.isDirty ? "text-unset" : "text-muted-foreground",
  //               "transition-colors",
  //             )}
  //           />
  //         </FormControl>
  //         <FormMessage />
  //       </FormItem>
  //     )}
  //   />
  // ),
  // artworkUrls: ({ form }) => (
  //   <FormField
  //     name="artworkUrls"
  //     disabled
  //     control={form.control}
  //     render={({ field, fieldState }) => (
  //       <FormItem>
  //         <FormLabel>Artworks</FormLabel>
  //         <FormControl>
  //           <Input
  //             {...field}
  //             className={cn(
  //               fieldState.isDirty ? "text-unset" : "text-muted-foreground",
  //               "transition-colors",
  //             )}
  //           />
  //         </FormControl>
  //         <FormMessage />
  //       </FormItem>
  //     )}
  //   />
  // ),
  // videoUrls: ({ form }) => (
  //   <FormField
  //     name="videoUrls"
  //     disabled
  //     control={form.control}
  //     render={({ field, fieldState }) => (
  //       <FormItem>
  //         <FormLabel>Videos</FormLabel>
  //         <FormControl>
  //           <Input
  //             {...field}
  //             className={cn(
  //               fieldState.isDirty ? "text-unset" : "text-muted-foreground",
  //               "transition-colors",
  //             )}
  //           />
  //         </FormControl>
  //         <FormMessage />
  //       </FormItem>
  //     )}
  //   />
  // ),
} as const;
