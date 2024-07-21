"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Button } from "../ui/button";
import { UseFormReturn, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { LoaderIcon } from "lucide-react";
import { asOptionalString, cn, InferSchema } from "@/lib/utils";
import { DialogFooter } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useGameDetail } from "@/app/game/game-context";
import { GameMetadata } from "@/generated/retrom/models/metadata";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";

type FormFieldRenderer = ({
  form,
}: {
  form: UseFormReturn<FormSchema>;
}) => JSX.Element;

type EditableGameMetadata = Omit<
  GameMetadata,
  "gameId" | "createdAt" | "updatedAt"
>;
type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  igdbId: z.number().optional(),
  description: asOptionalString(z.string().optional()),
  coverUrl: asOptionalString(
    z.string().url({ message: "Cover URL must be a valid URL" }).optional(),
  ),
  backgroundUrl: asOptionalString(
    z
      .string()
      .url({ message: "Background URL must be a valid URL" })
      .optional(),
  ),
  iconUrl: asOptionalString(
    z.string().url({ message: "Icon URL must be a valid URL" }).optional(),
  ),
  links: z.array(z.string().url({ message: "Link must be a valid URL" })),
  videoUrls: z.array(
    z.string().url({ message: "Video URL must be a valid URL" }),
  ),
  artworkUrls: z.array(
    z.string().url({ message: "Artwork URL must be a valid URL" }),
  ),
  screenshotUrls: z.array(
    z.string().url({ message: "Screenshot URL must be a valid URL" }),
  ),
}) satisfies InferSchema<EditableGameMetadata>;

export function ManualTab() {
  const { game, gameMetadata } = useGameDetail();

  const { mutate, status } = useUpdateGameMetadata();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: gameMetadata?.name ?? "",
      igdbId: gameMetadata?.igdbId,
      description: gameMetadata?.description ?? "",
      coverUrl: gameMetadata?.coverUrl ?? "",
      backgroundUrl: gameMetadata?.backgroundUrl ?? "",
      iconUrl: gameMetadata?.iconUrl ?? "",
    },
  });

  const handleUpdate = useCallback(
    (values: FormSchema) => {
      const { igdbId, ...restValues } = values;
      const igdbIdNum = igdbId;
      const updated = { ...restValues, igdbId: igdbIdNum, gameId: game.id };

      mutate({ metadata: [updated] });
    },
    [game.id, mutate],
  );

  return (
    <>
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <div className="my-4 grid grid-cols-2 gap-4">
              {Object.entries(fields).map(([key, FormFieldRenderer]) => (
                <FormFieldRenderer form={form} key={key} />
              ))}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="mt-4"
                disabled={
                  !form.formState.isValid ||
                  Object.keys(form.formState.dirtyFields).length === 0
                }
              >
                <LoaderIcon
                  className={cn(
                    "animate-spin absolute",
                    status !== "pending" && "opacity-0",
                  )}
                />
                <p className={cn(status === "pending" && "opacity-0")}>
                  Update Metadata
                </p>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </>
  );
}

const fields: Record<
  keyof Omit<EditableGameMetadata, "gameId">,
  FormFieldRenderer
> = {
  name: ({ form }) => (
    <FormField
      name="name"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
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
  igdbId: ({ form }) => (
    <FormField
      name="igdbId"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>IGDB ID</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
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
    <div className="col-span-2 relative">
      <FormField
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormItem>
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
    </div>
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
  links: ({ form }) => (
    <FormField
      name="links"
      disabled
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Links</FormLabel>
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
  screenshotUrls: ({ form }) => (
    <FormField
      name="screenshotUrls"
      disabled
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Screenshots</FormLabel>
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
  artworkUrls: ({ form }) => (
    <FormField
      name="artworkUrls"
      disabled
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Artworks</FormLabel>
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
  videoUrls: ({ form }) => (
    <FormField
      name="videoUrls"
      disabled
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Videos</FormLabel>
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
} as const;
