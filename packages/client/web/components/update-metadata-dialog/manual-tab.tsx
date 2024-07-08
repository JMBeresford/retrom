"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpdateGameMetadataRequest } from "@/generated/retrom/services";
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
import { useToast } from "../ui/use-toast";
import { LoaderIcon } from "lucide-react";
import { asOptionalString, cn } from "@/lib/utils";
import { DialogFooter } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useGameDetail } from "@/app/game/game-context";
import { useMutation } from "@tanstack/react-query";
import { useRetromClient } from "@/providers/retrom-client";
import { GameMetadata } from "@/generated/retrom/models";
import { useUpdateGameMetadata } from "@/mutations/useUpdateGameMetadata";

type FormFieldRenderer = ({
  form,
}: {
  form: UseFormReturn<FormSchema>;
}) => JSX.Element;

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  igdbId: asOptionalString(z.string().optional()),
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
});

export function ManualTab() {
  const { game, gameMetadata } = useGameDetail();

  const { mutate, status } = useUpdateGameMetadata();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: gameMetadata?.name ?? "",
      igdbId: gameMetadata?.igdbId?.toString() ?? "",
      description: gameMetadata?.description ?? "",
      coverUrl: gameMetadata?.coverUrl ?? "",
      backgroundUrl: gameMetadata?.backgroundUrl ?? "",
      iconUrl: gameMetadata?.iconUrl ?? "",
    },
  });

  const handleUpdate = useCallback(
    (values: FormSchema) => {
      const { igdbId, ...restValues } = values;
      const igdbIdNum = igdbId !== undefined ? parseInt(igdbId) : undefined;
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

const fields: Record<keyof Omit<GameMetadata, "gameId">, FormFieldRenderer> = {
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
} as const;
