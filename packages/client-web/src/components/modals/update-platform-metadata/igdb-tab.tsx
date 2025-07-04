import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetIgdbPlatformSearchResultsRequest } from "@retrom/codegen/retrom/services/metadata-service_pb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useCallback, useState } from "react";
import { Button } from "../../ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { useToast } from "../../ui/use-toast";
import { Separator } from "../../ui/separator";
import { LoaderCircleIcon } from "lucide-react";
import { cn, getFileStub } from "@/lib/utils";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { Platform } from "@retrom/codegen/retrom/models/platforms_pb";
import { useNavigate } from "@tanstack/react-router";
import { PlatformMetadata } from "@retrom/codegen/retrom/models/metadata_pb";
import { useUpdatePlatformMetadata } from "@/mutations/useUpdatePlatformMetadata";

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z
  .object({
    search: z.string().max(255),
    igdbId: z.coerce.number().optional(),
  })
  .refine((data) => data.igdbId || data.search, {
    message: "You must provide either a search term or an IGDB ID",
  });

export function IgdbTab(props: {
  platform: Platform;
  currentMetadata?: PlatformMetadata;
}) {
  const { currentMetadata, platform } = props;
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>();
  const navigate = useNavigate();
  const retromClient = useRetromClient();

  const [searchRequest, setSearchRequest] =
    useState<GetIgdbPlatformSearchResultsRequest>({
      query: {
        search: {
          value: currentMetadata?.name ?? getFileStub(platform.path),
        },
        platformId: platform.id,
        fields: {
          id: currentMetadata?.igdbId,
        },
      },
    });

  const { data: matches, isPending: searchPending } = useQuery({
    enabled: !!searchRequest,
    queryKey: ["platforms", "igdb-search", searchRequest],
    queryFn: async () => {
      if (
        !searchRequest.query?.search?.value &&
        !searchRequest.query?.fields?.id
      ) {
        return null;
      }

      return await retromClient.metadataClient.getIgdbPlatformSearchResults(
        searchRequest,
      );
    },
    select: (data) => data?.metadata ?? [],
  });

  const { mutateAsync: updateMetadata, isPending: updatePending } =
    useUpdatePlatformMetadata();

  const loading = searchPending || updatePending;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: currentMetadata?.name ?? getFileStub(platform.path),
      igdbId: currentMetadata?.igdbId,
    },
  });

  const handleSearch = useCallback(
    (values: FormSchema) => {
      const { search, igdbId } = values;

      if (!platform) {
        return;
      }

      setSearchRequest({
        query: {
          search: {
            value: search,
          },
          fields: {
            id: igdbId,
          },
          platformId: platform.id,
        },
      });
    },
    [platform],
  );

  const handleUpdate = useCallback(async () => {
    if (!selectedMatch || !matches) {
      return;
    }

    const match = matches.find((m) => m.igdbId?.toString() === selectedMatch);

    if (!match) {
      toast({
        title: "Error updating metadata",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMetadata({
        metadata: [{ ...match, platformId: platform.id }],
      });

      void navigate({
        to: ".",
        search: (prev) => ({ ...prev, updateMetadataModal: undefined }),
      });
    } catch {
      toast({
        title: "Error updating metadata",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
    }
  }, [matches, selectedMatch, platform, toast, updateMetadata, navigate]);

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
                    <Input {...field} autoFocus={true} />
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

            <Button type="submit" className="w-full sm:w-auto">
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
                <span className="text-muted-foreground italic">
                  {matches && matches.length < 1
                    ? "Search for a platform"
                    : "Select a matching IGDB platform"}
                </span>
              }
            />
          </SelectTrigger>

          <SelectContent>
            {matches?.map((match, i) => (
              <SelectItem
                key={`${match.platformId}-${i}`}
                value={match.igdbId?.toString() ?? i.toString()}
              >
                {match.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button disabled={loading} variant="secondary">
            Cancel
          </Button>
        </DialogClose>

        <Button
          onClick={handleUpdate}
          disabled={selectedMatch === undefined || loading}
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
