import { FocusContainer } from "@/components/fullscreen/focus-container";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getFileName, Image, timestampToDate } from "@/lib/utils";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRetromClient } from "@/providers/retrom-client";
import { useGameDetail } from "@/providers/game-details";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileStat } from "@retrom/codegen/retrom/files";
import { EllipsisVertical, Loader2 } from "lucide-react";
import { useEmulatorJS } from "@/providers/emulator-js";
import { HotkeyIcon } from "@/components/fullscreen/hotkey-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApiUrl } from "@/utils/useApiUrl";

type Fn = () => void | Promise<void>;
type Tab =
  | "playPause"
  | "restartGame"
  | "syncSaveFile"
  | "saveState"
  | "loadState";

type TabOpts<Action extends Fn = Fn> = {
  action?: Action;
  label: string;
};

type StateInfo = {
  state?: Uint8Array;
  screenshot?: string;
  stat: FileStat;
};

export function GameOptions() {
  const emulatorJS = useEmulatorJS();
  const [paused, setPaused] = useState(!!emulatorJS.paused);
  const { toast } = useToast();
  const retromClient = useRetromClient();
  const { game } = useGameDetail();
  const [tab, setTab] = useState<Tab | undefined>(undefined);
  const apiUrl = useApiUrl();

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

  const saveState = useCallback(
    async (slot: number) => {
      if (!emulatorJS.gameManager) return;

      emulatorJS.changeSettingOption("save-state-slot", slot.toString());
      const state = emulatorJS.gameManager?.getState();
      const screenshot = await emulatorJS.gameManager?.screenshot();
      if (state && screenshot) {
        emulatorJS.callEvent("saveState", { state, screenshot });
      } else {
        toast({
          title: "Failed to sync save state",
          description: "Could not extract state info",
          variant: "destructive",
        });
      }
    },
    [emulatorJS, toast],
  );

  const { mutateAsync: importSaveState } = useMutation({
    mutationKey: ["import-save-state"],
    mutationFn: async (slot: number) => {
      const file = await new Promise<File>((resolve, reject) => {
        const el = document.createElement("input");
        el.type = "file";
        el.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (!file) {
            return reject(new Error("No file selected"));
          }

          resolve(file);
        };

        el.click();
      });

      const data = await file.arrayBuffer();

      emulatorJS.changeSettingOption("save-state-slot", slot.toString());
      emulatorJS.gameManager?.loadState(new Uint8Array(data));
      return saveState(slot);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { data: stateInfo } = useQuery({
    queryKey: ["all-save-states", apiUrl, emulatorJS.coreName, game.id],
    staleTime: Infinity,
    refetchOnMount: false,
    queryFn: async () => {
      const publicUrl = new URL("./rest/public/", apiUrl);
      const path = `states/${emulatorJS.coreName}/${game.id}/`;

      const { stats } = await retromClient.fileExplorerClient.getStat({ path });

      const states: Record<number, StateInfo | undefined> = {
        1: undefined,
        2: undefined,
        3: undefined,
        4: undefined,
        5: undefined,
        6: undefined,
        7: undefined,
        8: undefined,
        9: undefined,
      };

      const promises = [];
      for (let i = 1; i < 10; i++) {
        const stat = stats.find((s) => s.path.endsWith(`${i}.state`));
        if (!stat) continue;

        const screenshotPath = stats.find((s) =>
          s.path.endsWith(`${i}.png`),
        )?.path;

        const screenshot = screenshotPath
          ? new URL(`./${screenshotPath}`, publicUrl).toString()
          : undefined;

        states[i] = { screenshot, stat };

        if (stat) {
          promises.push(
            fetch(new URL(`./rest/public/${stat.path}`, apiUrl).toString())
              .then(async (res) => {
                if (!res.ok) {
                  return;
                }

                if (!states[i]) {
                  throw new Error("Something went wrong. State info not found");
                }

                states[i]!.state = new Uint8Array(await res.arrayBuffer());
              })
              .catch(console.error),
          );
        }
      }

      await Promise.allSettled(promises);
      return states;
    },
  });

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
                      const { label, action } = tabOpts as TabOpts;

                      return (
                        <MenuEntryButton
                          key={key}
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
            <StateList
              stateInfo={stateInfo ?? {}}
              action={saveState}
              remoteAction={{
                label: "Import State",
                action: (slot) => importSaveState(slot),
              }}
              label="save-states"
            />
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
            <StateList
              stateInfo={stateInfo ?? {}}
              action={(slot) => {
                emulatorJS.settings["save-state-slot"] = slot.toString();
                emulatorJS.callEvent("loadState", {});
              }}
              remoteAction={{
                label: "Export State",
                action: (slot) => {
                  const info = stateInfo?.[slot];
                  const state = info?.state;
                  if (info === undefined || state === undefined) {
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
                },
              }}
              label="load-states"
            />
          </FocusContainer>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StateList(props: {
  stateInfo?: Record<number, StateInfo | undefined>;
  action: (slot: number) => void | Promise<void>;
  remoteAction: {
    label: string;
    action: (slot: number) => void | Promise<void>;
  };
  label: string;
}) {
  const { stateInfo, action, remoteAction, label } = props;

  function Slot(props: { slot: number }) {
    const { slot } = props;
    const info = stateInfo?.[slot];
    const { screenshot, stat } = info ?? {};
    const id = `${label}-${slot}`;
    const [optsOpen, setOptsOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);

    return (
      <DropdownMenu open={optsOpen} onOpenChange={setOptsOpen}>
        <MenuEntryButton
          id={id}
          ref={ref}
          onClick={() => (info?.state === undefined ? null : action(slot))}
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
              {screenshot ? (
                <Image src={screenshot} />
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
                  onClick={async () => await remoteAction.action(slot)}
                >
                  {remoteAction.label}
                </MenuEntryButton>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <MenuEntryButton disabled={!stat} id={id + "-delete"}>
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
        {stateInfo === undefined ? (
          <div className="flex flex-col">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          Object.keys(stateInfo).map((slot) => (
            <Slot key={slot} slot={Number(slot)} />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
