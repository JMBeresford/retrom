import { FocusContainer } from "@/components/fullscreen/focus-container";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getFileName, Image, timestampToDate } from "@/lib/utils";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useGameDetail } from "@/providers/game-details";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EllipsisVertical } from "lucide-react";
import { useEmulatorJS } from "@/providers/emulator-js";
import { HotkeyIcon } from "@/components/fullscreen/hotkey-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSaveEJSState } from "@/mutations/emulator-js/useSaveEJSState";
import { useImportEJSState } from "@/mutations/emulator-js/useImportEJSState";
import { useEJSSaveState } from "@/queries/emulator-js/useEJSSaveState";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { useRemoteFiles } from "../useRemoteFiles";

type Fn = () => void | Promise<void>;
type Tab =
  | "playPause"
  | "restartGame"
  | "syncSaveFile"
  | "saveState"
  | "loadState";

type TabOpts<Action extends Fn = Fn> = {
  action?: Action;
  disabled?: boolean;
  label: string;
};

const Slots = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function GameOptions() {
  const emulatorJS = useEmulatorJS();
  const [paused, setPaused] = useState(!!emulatorJS.paused);
  const [tab, setTab] = useState<Tab | undefined>(undefined);

  const Actions = {
    Gameplay: {
      playPause: {
        label: paused ? "Resume Game" : "Pause Game",
        action: () => {
          const current = !!emulatorJS.paused;
          if (current) {
            emulatorJS.play();
          } else {
            emulatorJS.pause();
          }

          setPaused(!current);
        },
      },
      restartGame: {
        label: "Restart Game",
        action: () => {
          emulatorJS.gameManager?.restart();
        },
      },
    },
    ["Cloud Saves"]: {
      syncSaveFile: {
        label: "Sync Save File",
        disabled: !emulatorJS.saveFileExt,
        action: () => {
          emulatorJS.callEvent("saveSave", {});
        },
      },
      saveState: {
        label: "Save State",
      },
      loadState: {
        label: "Load State",
      },
    },
  } as const satisfies Record<
    string,
    Partial<Record<NonNullable<Tab>, TabOpts>>
  >;

  return (
    <div className="flex h-full">
      <ScrollArea
        className={cn(
          "flex flex-col h-full min-w-48",
          "bg-background border-r",
        )}
      >
        <FocusContainer
          className={cn(
            "block py-6",
            "transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
          )}
          opts={{
            focusKey: "game-options-menu",
          }}
        >
          <HotkeyLayer id="game-options-menu">
            <div className="flex flex-col gap-5">
              {Object.entries(Actions).map(([groupName, group]) => (
                <div key={groupName}>
                  <h2 className="text-sm text-muted-foreground font-bold px-4 mb-1">
                    {groupName}
                  </h2>
                  <div className="flex flex-col h-full">
                    {Object.entries(group).map(([key, tabOpts]) => {
                      const { label, action, disabled } = tabOpts as TabOpts;

                      return (
                        <MenuEntryButton
                          key={key}
                          disabled={disabled}
                          id={`game-options-${key}`}
                          className="text-base"
                          data-state={key === tab ? "active" : undefined}
                          onClick={action}
                          onFocus={() => setTab(key as Tab)}
                        >
                          {label}
                        </MenuEntryButton>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </HotkeyLayer>
        </FocusContainer>
      </ScrollArea>

      <Sheet modal={false} open={tab === "saveState"}>
        <SheetContent
          className={cn(
            "absolute left-full inset-y-0 z-[-1] flex flex-col",
            "outline-none fill-mode-both",
          )}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Save State</SheetTitle>
            <SheetDescription>
              Select a slot to save a state in
            </SheetDescription>
          </SheetHeader>
          <FocusContainer
            className="flex flex-col h-full w-fit bg-background"
            opts={{
              focusKey: "game-options-save-states",
              focusable: tab === "saveState",
            }}
          >
            <StateList listKind="save" />
          </FocusContainer>
        </SheetContent>
      </Sheet>

      <Sheet modal={false} open={tab === "loadState"}>
        <SheetContent
          className={cn(
            "absolute left-full inset-y-0 z-[-1] flex flex-col",
            "outline-none fill-mode-both",
          )}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Load State</SheetTitle>
            <SheetDescription>Select a slot to load</SheetDescription>
          </SheetHeader>
          <FocusContainer
            className="flex flex-col h-full w-fit bg-background"
            opts={{
              focusKey: "game-options-load-states",
              focusable: tab === "loadState",
            }}
          >
            <StateList listKind="load" />
          </FocusContainer>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StateList(props: { listKind: "save" | "load" }) {
  const { listKind } = props;
  const label = listKind === "save" ? "save-state" : "load-state";
  const { game } = useGameDetail();

  function Slot(props: { slot: number }) {
    const { slot } = props;
    const { toast } = useToast();
    const emulatorJS = useEmulatorJS();
    const { data: info, refetch } = useEJSSaveState(slot, game.id);
    const { screenshot, stat } = info ?? {};
    const id = `${label}-${slot}`;
    const [optsOpen, setOptsOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const { getPublicUrl, deleteFiles } = useRemoteFiles();

    const { mutateAsync: saveState } = useSaveEJSState();
    const { mutateAsync: importSaveState } = useImportEJSState();

    const disabled = listKind === "load" && info?.state === undefined;

    const action = useCallback(async () => {
      if (listKind === "save") {
        await saveState({ slot, core: emulatorJS.coreName, gameId: game.id });
      } else {
        emulatorJS.settings["save-state-slot"] = slot.toString();
        emulatorJS.callEvent("loadState", {});
      }

      return navigate({
        to: ".",
        search: (prev) => ({ ...prev, overlay: false }),
      }).catch(console.error);
    }, [slot, emulatorJS, saveState, navigate]);

    const remoteAction = useCallback(async () => {
      if (listKind === "save") {
        await importSaveState({
          slot,
          core: emulatorJS.coreName,
          gameId: game.id,
        });
      } else {
        const state = info?.state;
        if (!info || state === undefined) {
          return;
        }

        const stat = info.stat;
        const blob = new Blob([state], {
          type: "application/octet-stream",
        });

        const fileName = getFileName(stat.path);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
        URL.revokeObjectURL(url);
        a.remove();

        toast({
          title: "State exported",
          description: "State has been exported successfully",
        });
      }
    }, [slot, emulatorJS, info, importSaveState, toast]);

    const deleteState = useCallback(async () => {
      if (!stat) {
        return;
      }

      const path = stat.path;
      await deleteFiles.mutateAsync(path);

      toast({
        title: "State deleted",
        description: "State has been deleted successfully",
      });

      refetch().catch(console.error);

      return navigate({
        to: ".",
        search: (prev) => ({ ...prev, overlay: false }),
      }).catch(console.error);
    }, [deleteFiles, stat, toast, navigate, refetch]);

    return (
      <DropdownMenu open={optsOpen} onOpenChange={setOptsOpen}>
        <MenuEntryButton
          id={id}
          ref={ref}
          onClick={() => (disabled ? null : action())}
          className="flex group"
          handlers={{
            OPTION: {
              handler: () => setOptsOpen((prev) => !prev),
              label: "Options",
            },
          }}
        >
          <div className="flex gap-4 w-full items-start">
            <div
              className={cn(
                "relative aspect-square h-16 overflow-hidden bg-black",
                "grid place-items-center",
              )}
            >
              {info === undefined ? (
                <Skeleton className="absolute inset-0" />
              ) : screenshot ? (
                <Image src={getPublicUrl(screenshot)} />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-muted">
                  <p className="font-black text-2xl text-muted-foreground/50">
                    {slot}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 text-left h-full">
              <h3 className="text-xl font-normal">Slot {slot}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {stat
                  ? timestampToDate(stat.updatedAt).toLocaleString()
                  : "Empty slot"}
              </p>
            </div>
          </div>

          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex gap-1 items-center mb-auto rounded p-2",
                "transition-all opacity-0 group-focus:opacity-100 group-hover:opacity-100",
                "bg-transparent hover:bg-white/5",
                "duration-300",
              )}
            >
              <HotkeyIcon hotkey="OPTION" className="text-xs leading-[0]" />
              <EllipsisVertical size={16} />
            </div>
          </DropdownMenuTrigger>
        </MenuEntryButton>

        <FocusContainer
          opts={{
            focusKey: id + "-options",
            focusable: false,
            isFocusBoundary: true,
            onFocus: () => {
              ref.current?.focus();
            },
          }}
          className="flex flex-col"
        >
          <DropdownMenuContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="p-0 [&_button]:py-3 [&_button]:pl-4"
          >
            <HotkeyLayer
              id={id + "-options"}
              handlers={{
                BACK: { handler: () => setOptsOpen(false), label: "Close" },
              }}
            >
              <DropdownMenuItem asChild>
                <MenuEntryButton
                  id={id + "-upload"}
                  onClick={async () => {
                    if (info) {
                      await remoteAction();
                    }
                  }}
                >
                  {listKind === "save" ? "Import State" : "Download State"}
                </MenuEntryButton>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <MenuEntryButton
                  disabled={!stat}
                  id={id + "-delete"}
                  onClick={deleteState}
                >
                  Delete
                </MenuEntryButton>
              </DropdownMenuItem>
            </HotkeyLayer>
          </DropdownMenuContent>
        </FocusContainer>
      </DropdownMenu>
    );
  }

  return (
    <ScrollArea
      className={cn(
        "flex flex-col w-fit min-w-56",
        "transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
      )}
    >
      <div className="flex flex-col py-6">
        {Slots.map((slot) => (
          <Slot key={slot} slot={slot} />
        ))}
      </div>
    </ScrollArea>
  );
}
