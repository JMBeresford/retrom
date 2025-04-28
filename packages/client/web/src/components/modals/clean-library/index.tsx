import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { ChevronsUpDown, LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRetromClient } from "@/providers/retrom-client";
import { useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useModalAction } from "@/providers/modal-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function CleanLibraryModal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();
  const navigate = useNavigate();
  const { cleanLibraryModal } = RootRoute.useSearch();
  const { openModal: confirm } = useModalAction("confirmModal");

  const { data, status: dryRunStatus } = useQuery({
    queryKey: ["clean-library-dry-run"],
    queryFn: () =>
      retromClient.libraryClient.deleteMissingEntries({ dryRun: true }),
  });

  const { mutate, status } = useMutation({
    onError: (err) => {
      toast({
        title: "Error cleaning library",
        variant: "destructive",
        description: err.message,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          [
            "library",
            "games",
            "platforms",
            "metadata",
            "clean-library-dry-run",
          ].some((key) => queryKey.includes(key)),
      });

      toast({
        title: "Library cleaned!",
        description: "Library has been successfully pruned of missing entries.",
      });

      return navigate({
        to: "/",
        search: (prev) => ({ ...prev, cleanLibraryModal: undefined }),
      });
    },
    mutationFn: async () =>
      await retromClient.libraryClient.deleteMissingEntries({ dryRun: false }),
  });

  const error = dryRunStatus === "error" || status === "error";
  const pending = dryRunStatus === "pending" || status === "pending";

  const clean =
    data &&
    data.platformsDeleted.length === 0 &&
    data.gameFilesDeleted.length === 0 &&
    data.gamesDeleted.length === 0;

  return (
    <Dialog
      open={!!cleanLibraryModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            search: (prev) => ({ ...prev, cleanLibraryModal: undefined }),
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clean Library</DialogTitle>
          <DialogDescription>
            This will remove all library items that rely on non-existant files
            and/or directories.
          </DialogDescription>
        </DialogHeader>

        {dryRunStatus === "pending" ? (
          <div className="flex justify-center">
            <LoaderCircleIcon
              size={"75px"}
              className="my-4 text-muted-foreground/50 animate-spin"
            />
          </div>
        ) : !error ? (
          clean ? (
            <div className="text-center flex flex-col gap-1 text-muted-foreground py-4">
              <h3 className="text-2xl font-bold">Nothing to do</h3>
              <p className="italic text-sm">It's so clean in here...</p>
            </div>
          ) : (
            <ScrollArea className={cn("max-h-[450px] flex flex-col gap-2")}>
              <List title="Platforms" items={data.platformsDeleted} />
              <List title="Games" items={data.gamesDeleted} />
              <List title="Game Files" items={data.gameFilesDeleted} />
            </ScrollArea>
          )
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button
            className="relative"
            variant="destructive"
            disabled={pending || clean}
            onClick={() =>
              confirm({
                title: "Are you sure?",
                description:
                  "This will permenantly remove the items from Retrom.",
                onConfirm: mutate,
              })
            }
          >
            <LoaderCircleIcon
              className={cn("animate-spin absolute", !pending && "opacity-0")}
            />
            <p className={cn(pending && "opacity-0")}>Delete</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function List(props: { title: string; items: { id: number; path: string }[] }) {
  const { title, items } = props;

  return (
    <Collapsible className="w-[70ch] max-w-[90dvw]">
      <CollapsibleTrigger asChild>
        <Button
          variant="inline"
          disabled={!items.length}
          className="flex items-center justify-between w-full px-3 py-2"
        >
          <h5 className="font-semibold">
            {items.length} {title}(s) will be removed
          </h5>
          <ChevronsUpDown size={14} />
        </Button>
      </CollapsibleTrigger>
      <Separator />

      <CollapsibleContent>
        <div className="flex flex-col">
          {items.map((item) => (
            <pre
              key={item.id}
              className={cn(
                "odd:bg-muted text-muted-foreground p-3 last:border-b text-xs",
                "hover:text-foreground transition-colors break-word whitespace-pre-wrap",
              )}
            >
              {item.path
                .split("/")
                .filter(Boolean)
                .map((part) => (
                  <span>
                    /{part}
                    <wbr />
                  </span>
                ))}
            </pre>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
