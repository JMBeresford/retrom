import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { IgdbSearchRequestSchema } from "@retrom/codegen/retrom/services/metadata/v1/igdb_service_pb";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui-next/components/dialog";
import { Button } from "@retrom/ui-next/components/button";
import { useState } from "react";
import { create, isMessage } from "@bufbuild/protobuf";
import { cn } from "@retrom/ui-next/lib/utils";
import { ScrollArea } from "@retrom/ui-next/components/scroll-area";
import { Input } from "@retrom/ui-next/components/input";
import {
  GameMetadataSchema,
  PlatformMetadataSchema,
} from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import {
  defaultIgdbSearchFormValues,
  igdbSearchFormOptions,
  useIgdbSearchForm,
} from "./form";
import type {
  GameMetadata,
  PlatformMetadata,
} from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { IgdbSearchRequest } from "@retrom/codegen/retrom/services/metadata/v1/igdb_service_pb";
import type { BaseModalActionProps } from "@/modals/modals";
import { registerModalHandle } from "@/modals/use-modal-action";
import { useListIgdbPlatformMetadata } from "@/data/igdb/use-list-igdb-platform-metadata";
import { useListIgdbGameMetadata } from "@/data/igdb/use-list-igdb-game-metadata";

export type IgdbSearchFormDialogProps = Required<BaseModalActionProps> & {
  initialValue?: typeof defaultIgdbSearchFormValues;
} & (
    | {
        searchType: "platform";
        platformId: string;
        gameId?: never;
        onSubmit: (metadata: PlatformMetadata) => void | Promise<void>;
      }
    | {
        searchType: "game";
        gameId: string;
        platformId?: never;
        onSubmit: (metadata: GameMetadata) => void | Promise<void>;
      }
  );

declare global {
  namespace RetromModals {
    interface ModalActions {
      igdbSearchForm: IgdbSearchFormDialogProps;
    }
  }
}

const handle = Dialog.createHandle<IgdbSearchFormDialogProps>();
registerModalHandle("igdbSearchForm", handle);

function getModalState() {
  return handle.store.getSnapshot().payload;
}

export function IgdbSearchFormDialog() {
  const [searchRequest, setSearchRequest] = useState<
    IgdbSearchRequest | undefined
  >();

  const platformMetadataQuery = useListIgdbPlatformMetadata({
    request: { search: searchRequest, platformId: getModalState()?.platformId },
    options: {
      enabled: () =>
        getModalState()?.searchType === "platform" && !!searchRequest,
    },
  });

  const gameMetadataQuery = useListIgdbGameMetadata({
    request: { search: searchRequest, gameId: getModalState()?.gameId },
    options: {
      enabled: () => getModalState()?.searchType === "game" && !!searchRequest,
    },
  });

  const igdbSearchForm = useIgdbSearchForm({
    ...igdbSearchFormOptions,
    onSubmit: ({ value: { name } }) => {
      const modalState = getModalState();

      if (!modalState) {
        throw new Error("No modal state found for igdbSearch form dialog");
      }

      setSearchRequest(
        create(IgdbSearchRequestSchema, {
          search: {
            value: name,
          },
        }),
      );
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (open) {
      const modalState = getModalState();

      igdbSearchForm.reset(
        modalState?.initialValue ?? defaultIgdbSearchFormValues,
        { keepDefaultValues: false },
      );

      setSearchRequest(undefined);
    }
  };

  return (
    <Dialog handle={handle} onOpenChange={handleOpenChange}>
      {({ payload }) => {
        const { title, description, searchType, onSubmit } = payload ?? {};

        const handleSubmit = async (
          metadata: PlatformMetadata | GameMetadata,
        ) => {
          if (
            searchType === "platform" &&
            isMessage(metadata, PlatformMetadataSchema)
          ) {
            await onSubmit?.(metadata);
          } else if (
            searchType === "game" &&
            isMessage(metadata, GameMetadataSchema)
          ) {
            await onSubmit?.(metadata);
          }

          handle.close();
        };

        return (
          <DialogContent>
            <igdbSearchForm.AppForm>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription render={<span>{description}</span>} />
              </DialogHeader>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  igdbSearchForm.handleSubmit().catch(console.error);
                }}
              >
                <igdbSearchForm.AppField name="name">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field>
                        <FieldLabel>Name</FieldLabel>

                        <div className="flex gap-2 items-center">
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Enter a name to search for..."
                          />

                          <igdbSearchForm.SearchButton />
                        </div>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}

                        <FieldDescription>
                          Provide a name to search for in the IGDB database.
                        </FieldDescription>
                      </Field>
                    );
                  }}
                </igdbSearchForm.AppField>
              </form>

              {platformMetadataQuery.data?.platformMetadata.map((meta, idx) => (
                <PlatformMetadataItem
                  key={idx}
                  metadata={meta}
                  onSelect={handleSubmit}
                />
              ))}

              {gameMetadataQuery.data?.gameMetadata.map((meta, idx) => (
                <GameMetadataItem
                  key={idx}
                  metadata={meta}
                  onSelect={handleSubmit}
                />
              ))}

              <DialogFooter>
                <DialogClose render={<Button variant="ghost">Close</Button>} />
              </DialogFooter>
            </igdbSearchForm.AppForm>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}

function PlatformMetadataItem({
  metadata,
  onSelect,
}: {
  metadata: PlatformMetadata;
  onSelect: (metadata: PlatformMetadata) => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 items-center p-2 h-25 rounded-md",
        "bg-transparent hover:bg-secondary/10 transition-colors",
      )}
    >
      <div
        className={cn(
          "aspect-square h-full shrink-0",
          "relative rounded-md overflow-hidden bg-[color-mix(in_oklch,var(--primary)_90%,white)]",
        )}
      >
        <img
          src={metadata.logoUrl}
          className="aspect-square w-full object-contain p-2"
        />
      </div>

      <div className="relative flex flex-col gap-1 h-full overflow-hidden w-full">
        <h3 className="font-semibold">{metadata.name}</h3>
        <ScrollArea className="h-full">
          <p
            className={cn(
              "text-sm text-muted-foreground",
              !metadata.description && "opacity-50 italic",
            )}
          >
            {metadata.description || "No description available."}
          </p>
        </ScrollArea>
      </div>

      <Button onClick={() => onSelect(metadata)}>Select</Button>
    </div>
  );
}

function GameMetadataItem({
  metadata,
  onSelect,
}: {
  metadata: GameMetadata;
  onSelect: (metadata: GameMetadata) => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 items-center p-2 h-30 rounded-md",
        "bg-transparent hover:bg-secondary/10 transition-colors",
      )}
    >
      <div
        className={cn(
          "aspect-3/4 h-full shrink-0",
          "relative rounded-md overflow-hidden bg-secondary",
        )}
      >
        <img
          src={metadata.coverUrl}
          className="aspect-3/4 w-full object-contain"
        />
      </div>

      <div className="relative flex flex-col gap-1 h-full overflow-hidden w-full">
        <h3 className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis shrink-0">
          {metadata.name}
        </h3>

        <ScrollArea className="h-full">
          <p
            className={cn(
              "text-sm text-muted-foreground",
              !metadata.description && "opacity-50 italic",
            )}
          >
            {metadata.description || "No description available."}
          </p>
        </ScrollArea>
      </div>

      <Button onClick={() => onSelect(metadata)}>Select</Button>
    </div>
  );
}
