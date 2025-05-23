import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Button } from "../../ui/button";
import { UseFormReturn, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { LoaderCircleIcon } from "lucide-react";
import { cn, getFileName, InferSchema } from "@/lib/utils";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import { PlatformMetadata } from "@retrom/codegen/retrom/models/metadata_pb";
import type { useUpdatePlatformMetadata } from "@/mutations/useUpdatePlatformMetadata";
import { useNavigate } from "@tanstack/react-router";
import { Platform } from "@retrom/codegen/retrom/models/platforms_pb";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdatePlatforms } from "@/mutations/useUpdatePlatforms";

type FormFieldRenderer = ({
  form,
}: {
  form: UseFormReturn<FormSchema>;
}) => JSX.Element;

type EditablePlatformMetadata = Omit<
  PlatformMetadata,
  "platformId" | "igdbId" | "createdAt" | "updatedAt"
>;

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  description: z.string().optional(),
  backgroundUrl: z
    .literal("")
    .or(z.string().url({ message: "Background URL must be a valid URL" })),
  logoUrl: z
    .literal("")
    .or(z.string().url({ message: "Logo URL must be a valid URL" })),
  renameDirectory: z.boolean().optional(),
}) satisfies InferSchema<EditablePlatformMetadata>;

export function ManualTab(props: {
  platform: Platform;
  platformMetadata?: PlatformMetadata;
}) {
  const { platform, platformMetadata } = props;
  const navigate = useNavigate();

  const { mutateAsync: updateMetadata, status: metadataStatus } =
    useUpdatePlatformMetadata();

  const { mutateAsync: updatePlatforms } = useUpdatePlatforms();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: platformMetadata?.name ?? "",
      description: platformMetadata?.description ?? "",
      backgroundUrl: platformMetadata?.backgroundUrl ?? "",
      logoUrl: platformMetadata?.logoUrl ?? "",
      renameDirectory: false,
    },
  });

  const handleUpdate = useCallback(
    async (values: FormSchema) => {
      const updated = {
        ...values,
        platformId: platform.id,
      };

      const res = await updateMetadata({ metadata: [updated] });
      if (values.renameDirectory) {
        const newName = res.metadataUpdated[0]?.name;

        if (newName) {
          const currentFilename = getFileName(platform.path);
          const path = platform.path.replace(currentFilename, newName);

          await updatePlatforms({
            platforms: [{ id: platform.id, path }],
          });
        }
      }

      form.reset(updated);

      return navigate({
        to: ".",
        search: (prev) => ({ ...prev, updatePlatformMetadataModal: undefined }),
      });
    },
    [form, updateMetadata, navigate, platform, updatePlatforms],
  );

  const pending = metadataStatus === "pending";
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 w-full sm:mt-4">
                <FormField
                  name="renameDirectory"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-top gap-2">
                      <Checkbox
                        id="rename-directory"
                        disabled={platform.thirdParty}
                        checked={field.value}
                        onCheckedChange={(event) => field.onChange(!!event)}
                      />

                      <div
                        className={cn(
                          "grid gap-1 5 leading-none",
                          platform.thirdParty && "opacity-50",
                        )}
                      >
                        <label htmlFor="rename-directory">
                          Rename Directory
                        </label>

                        <p className="text-sm text-muted-foreground">
                          This will alter the file system
                        </p>
                      </div>
                    </div>
                  )}
                />

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:ml-auto">
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

const fields: Record<keyof EditablePlatformMetadata, FormFieldRenderer> = {
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
  logoUrl: ({ form }) => (
    <FormField
      name="logoUrl"
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Logo Image URL</FormLabel>
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
