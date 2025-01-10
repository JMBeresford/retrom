import { Badge } from "@/components/ui/badge";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  useDialogOpen,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputStyles } from "@/components/ui/input";
import {
  Emulator,
  EmulatorProfile,
  NewEmulatorProfile,
} from "@/generated/retrom/models/emulators";
import { cn, InferSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useCreateEmulatorProfiles } from "@/mutations/useCreateEmulatorProfile";
import { useUpdateEmulatorProfiles } from "@/mutations/useUpdateEmulatorProfiles";
import { LoaderCircleIcon } from "lucide-react";

type Props = {
  emulator: Emulator;
  existingProfile?: EmulatorProfile;
};

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  supportedExtensions: z
    .string()
    .min(1)
    .array()
    .min(1, { message: "At least one file extension is required" }),
  customArgs: z
    .array(z.string())
    .transform((args) => args.filter((arg) => arg.length > 0))
    .refine(
      (args) =>
        args.length === 0 ||
        args.includes("{file}") ||
        args.includes('"{file}"') ||
        args.includes("{install_dir}") ||
        args.includes('"{install_dir}"'),
      {
        message: "Custom arguments must include {file} or {install_dir}",
      },
    ),
}) satisfies InferSchema<Omit<NewEmulatorProfile, "emulatorId">>;

export function EditProfileDialog(props: Props) {
  const { emulator, existingProfile } = props;
  const { setOpen } = useDialogOpen();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: existingProfile?.name ?? "",
      supportedExtensions: existingProfile?.supportedExtensions ?? [],
      customArgs: existingProfile?.customArgs ?? [],
    },
  });

  const { mutate: createProfiles, status: creationStatus } =
    useCreateEmulatorProfiles();
  const { mutate: updateProfiles, status: updateStatus } =
    useUpdateEmulatorProfiles();

  const pending = creationStatus === "pending" || updateStatus === "pending";
  const { isDirty } = form.formState;
  const canSubmit = isDirty && !pending;

  const handleSubmit = useCallback(
    (values: FormSchema) => {
      if (existingProfile) {
        const profile = {
          ...existingProfile,
          ...values,
        };

        updateProfiles({
          profiles: [profile],
        });

        form.reset(profile);
      } else {
        const profile = {
          ...values,
          emulatorId: emulator.id,
        };

        createProfiles({
          profiles: [profile],
        });

        form.reset();
      }

      setOpen(false);
    },
    [emulator, createProfiles, updateProfiles, existingProfile, setOpen, form],
  );

  return (
    <DialogContent className="w-[60dvw] max-w-[100%]">
      <DialogHeader>
        <DialogTitle>
          {existingProfile ? "Edit" : "Create"} Profile for {emulator.name}
        </DialogTitle>
        <DialogDescription>
          Emulator profiles define a configuration for a given emulator.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          className="space-y-2 w-full"
          onSubmit={() => void form.handleSubmit(handleSubmit)()}
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter profile name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="supportedExtensions"
            control={form.control}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Supported Extensions</FormLabel>
                  <div className={cn(InputStyles, "flex items-center gap-2")}>
                    <div className="flex gap-1">
                      {field.value.map((ext, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          onClick={() =>
                            field.onChange(field.value.filter((e) => e !== ext))
                          }
                          className="hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                        >
                          {ext}
                        </Badge>
                      ))}
                    </div>

                    <FormControl>
                      <Input
                        className="focus-visible:ring-0 focus-visible:ring-offset-0 border-none p-0 m-0 bg-transparent w-full"
                        onBlur={(e) => {
                          if (e.currentTarget.value) {
                            field.onChange([
                              ...field.value,
                              e.currentTarget.value,
                            ]);
                            e.currentTarget.value = "";
                          }
                        }}
                        onKeyDown={(e) => {
                          const adding = [",", "Enter", " "].includes(e.key);
                          const isEmpty = !e.currentTarget.value?.length;

                          if (adding) {
                            e.preventDefault();
                          }

                          if (adding && !isEmpty) {
                            field.onChange([
                              ...field.value,
                              e.currentTarget.value,
                            ]);

                            e.currentTarget.value = "";
                          } else if (e.key === "Backspace" && isEmpty) {
                            field.onChange(field.value.slice(0, -1));
                          }
                        }}
                        placeholder="Add extension (enter, space, comma to submit)"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name="customArgs"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Arguments</FormLabel>
                <FormControl>
                  <Input
                    value={field.value.join(" ")}
                    onChange={(event) =>
                      field.onChange(parseArgs(event.target.value))
                    }
                    placeholder="Enter custom arguments"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 pt-4 ml-auto max-w-max grid-cols-2">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              {pending ? (
                <LoaderCircleIcon />
              ) : existingProfile ? (
                "Update Profile"
              ) : (
                "Create Profile"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

function parseArgs(argsString: string): string[] {
  const args = [];

  let current = "";

  // normalize 'start' and 'end' quote characters for easy pairing
  argsString = argsString.replace(/“|”/g, '"').replace(/‘|’/g, "'");
  const quoteChars = ['"', "'", "`"];
  const quoteStack: string[] = [];

  for (const char of argsString) {
    if (quoteChars.includes(char)) {
      if (quoteStack[quoteStack.length - 1] === char) {
        quoteStack.pop();
      } else {
        quoteStack.push(char);
      }
    }

    if (char === " " && quoteStack.length === 0) {
      if (current.length > 0) {
        args.push(current);
      }

      current = "";
    } else {
      current += char;
    }
  }

  args.push(current);

  return args;
}
