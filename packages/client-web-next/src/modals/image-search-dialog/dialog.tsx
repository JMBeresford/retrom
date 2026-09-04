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
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Field } from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import { Separator } from "@retrom/ui-next/components/separator";
import { IgdbFilters_FilterOperator } from "@retrom/codegen/retrom/providers/igdb/v1/igdb_pb";
import { cn } from "@retrom/ui-next/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { registerModalHandle } from "../use-modal-action";
import type { IgdbFilters_FilterValueSchema } from "@retrom/codegen/retrom/providers/igdb/v1/igdb_pb";
import type { IgdbSearchRequestSchema } from "@retrom/codegen/retrom/services/metadata/v1/igdb_service_pb";
import type { BaseModalActionProps } from "../modals";
import type {
  GameMetadata,
  PlatformMetadata,
} from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import type { MessageInitShape } from "@bufbuild/protobuf";
import { useListIgdbPlatformMetadata } from "@/data/igdb/use-list-igdb-platform-metadata";
import { useListIgdbGameMetadata } from "@/data/igdb/use-list-igdb-game-metadata";
import { igdbQueryKeys } from "@/data/igdb/queries";

type PlatformSearchType = "logoUrl";
type PlatformSearchProps = {
  [K in PlatformSearchType]: {
    field: K;
    onSubmit: (value: PlatformMetadata[K]) => void | Promise<void>;
  };
}[PlatformSearchType];

type GameSearchType = "iconUrl" | "coverUrl" | "backgroundUrl";
type GameSearchProps = {
  [K in GameSearchType]: {
    field: K;
    onSubmit: (value: GameMetadata[K]) => void | Promise<void>;
  };
}[GameSearchType];

export type ImageSearchDialogProps = BaseModalActionProps & {
  initialSearch?: string;
} & (
    | { platform: PlatformSearchProps; game?: never }
    | { platform?: never; game: GameSearchProps }
  );

declare global {
  namespace RetromModals {
    interface ModalActions {
      imageSearch: ImageSearchDialogProps;
    }
  }
}

const handle = Dialog.createHandle<ImageSearchDialogProps>();
registerModalHandle("imageSearch", handle);

export function ImageSearchDialog() {
  return (
    <Dialog handle={handle}>
      {function Render({ payload }) {
        const {
          title = "Image Search",
          description = "Search for an image across configured metadata providers.",
          initialSearch = "",
        } = payload ?? {};

        const queryClient = useQueryClient();
        const [request, setRequest] = useState<
          MessageInitShape<typeof IgdbSearchRequestSchema> | undefined
        >();

        const searchForm = useForm({
          defaultValues: {
            search: initialSearch,
          },
          onSubmit: ({ value: formValue }) => {
            const value = formValue.search;

            setRequest({
              search: { value },
              pagination: {
                limit: 25,
              },
              filters: {
                filters: fieldNameToFilter(
                  payload?.platform ? "platform" : "game",
                  payload?.platform?.field ?? payload?.game?.field,
                ),
              },
            });
          },
        });

        const platformOpts = payload?.platform;
        const gameOpts = payload?.game;

        const platformQuery = useListIgdbPlatformMetadata({
          request: { search: request },
          options: {
            enabled: () => !!request && platformOpts !== undefined,
          },
        });

        const gameQuery = useListIgdbGameMetadata({
          request: { search: request },
          options: {
            enabled: () => !!request && gameOpts !== undefined,
          },
        });

        const isFetching = platformQuery.isFetching || gameQuery.isFetching;
        const isError = platformQuery.isError || gameQuery.isError;

        const close = () => {
          setRequest(undefined);
          searchForm.reset();

          queryClient
            .invalidateQueries({
              queryKey: igdbQueryKeys.listAllIgdbGameMetadata(),
            })
            .catch(console.error);
          queryClient
            .invalidateQueries({
              queryKey: igdbQueryKeys.listAllIgdbPlatformMetadata(),
            })
            .catch(console.error);

          handle.close();
        };

        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription render={<span>{description}</span>} />
            </DialogHeader>

            <searchForm.Field name="search">
              {(field) => (
                <Field>
                  <div className="flex gap-2 items-center">
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter search term..."
                    />

                    <Button onClick={() => searchForm.handleSubmit()}>
                      Search
                    </Button>
                  </div>
                </Field>
              )}
            </searchForm.Field>

            <Separator />

            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {platformOpts
                ? platformQuery.data?.platformMetadata
                    .flatMap((p) =>
                      p[platformOpts.field] ? [p[platformOpts.field]] : [],
                    )
                    .map((src, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "group relative rounded-md bg-input/50 cursor-pointer grid place-items-center",
                          "overflow-hidden",
                        )}
                        onClick={async () => {
                          await platformOpts.onSubmit(src);
                          close();
                        }}
                      >
                        <img
                          src={src}
                          className="object-contain scale-100 group-hover:scale-110 transition-transform p-2"
                        />
                      </div>
                    ))
                : gameOpts
                  ? gameQuery.data?.gameMetadata
                      .flatMap((g) =>
                        g[gameOpts.field] ? [g[gameOpts.field]] : [],
                      )
                      .map((src, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "group relative rounded-md bg-input/50 cursor-pointer grid place-items-center",
                            "overflow-hidden",
                          )}
                          onClick={async () => {
                            await gameOpts.onSubmit(src);
                            close();
                          }}
                        >
                          <img
                            src={src}
                            className="object-contain scale-100 group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ))
                  : null}
            </div>

            {isError ? (
              <p className="text-destructive text-center py-4">
                Error fetching search results. Please try again.
              </p>
            ) : isFetching ? (
              <div className="grid place-items-center py-10">
                <Loader2
                  size={40}
                  className="text-muted-foreground animate-spin"
                />
              </div>
            ) : gameQuery.data?.gameMetadata.length === 0 &&
              platformQuery.data?.platformMetadata.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No results found. Try a different search term.
              </p>
            ) : gameQuery.data === undefined &&
              platformQuery.data === undefined ? (
              <p className="text-muted-foreground text-center py-4">
                Enter a search term to find images.
              </p>
            ) : null}

            <DialogFooter className="flex justify-end gap-2 mt-4">
              <DialogClose
                render={
                  <Button variant="ghost" onClick={() => handle.close()}>
                    Cancel
                  </Button>
                }
              />
            </DialogFooter>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}

function fieldNameToFilter(
  resourceType: "game" | "platform",
  field?: PlatformSearchType | GameSearchType,
): { [key: string]: MessageInitShape<typeof IgdbFilters_FilterValueSchema> } {
  if (!field) {
    return {};
  }

  if (resourceType === "game") {
    switch (field) {
      case "coverUrl": {
        return {
          "cover.url": {
            operator: IgdbFilters_FilterOperator.NOT_EQUAL,
            value: "null",
          },
        };
      }
      default: {
        return {
          "artworks.url": {
            operator: IgdbFilters_FilterOperator.NOT_EQUAL,
            value: "null",
          },
        };
      }
    }
  } else {
    return {
      "versions.platform_logo.url": {
        operator: IgdbFilters_FilterOperator.NOT_EQUAL,
        value: "null",
      },
      "platform_logo.url": {
        operator: IgdbFilters_FilterOperator.NOT_EQUAL,
        value: "null",
      },
    };
  }
}
