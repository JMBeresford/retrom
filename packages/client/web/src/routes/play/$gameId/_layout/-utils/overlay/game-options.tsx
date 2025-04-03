import {
  FocusableElement,
  FocusContainer,
} from "@/components/fullscreen/focus-container";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import { cn, Image, timestampToDate } from "@/lib/utils";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useConfig } from "@/providers/config";
import { checkIsDesktop } from "@/lib/env";
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
import { Loader2 } from "lucide-react";

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

export function GameOptions(props: { emulatorJS: EmulatorJS }) {
  const { emulatorJS } = props;
  const [paused, setPaused] = useState(!!emulatorJS.paused);
  const { toast } = useToast();
  const { hostname, port } = useConfig((s) => s.server) ?? {};
  const retromClient = useRetromClient();
  const { game } = useGameDetail();
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

  const apiUrl = useMemo(() => {
    if (!checkIsDesktop()) {
      const url = new URL("/api/", window.location.href);
      return url;
    }

    if (!hostname) {
      return;
    }

    const url = new URL(hostname);
    if (port !== undefined) {
      url.port = port.toString();
    }

    return url;
  }, [hostname, port]);

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
    <FocusContainer
      className="flex h-full"
      opts={{ focusKey: "game-options-root", onBlur: () => setTab(undefined) }}
    >
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
                        <FocusableElement
                          key={key}
                          id={key}
                          opts={{
                            focusKey: `game-options-${key}`,
                          }}
                        >
                          <MenuEntryButton
                            className="text-base"
                            data-state={key === tab ? "active" : undefined}
                            onClick={action}
                            onFocus={() => setTab(key as Tab)}
                          >
                            {label}
                          </MenuEntryButton>
                        </FocusableElement>
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
              label="load-states"
            />
          </FocusContainer>
        </SheetContent>
      </Sheet>
    </FocusContainer>
  );
}

function StateList(props: {
  stateInfo?: Record<number, StateInfo | undefined>;
  action: (slot: number) => void | Promise<void>;
  label: string;
}) {
  const { stateInfo, action, label } = props;

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
          Object.entries(stateInfo).map(([_slot, info]) => {
            const slot = Number(_slot);
            const { screenshot, stat } = info ?? {};

            return (
              <FocusableElement
                key={slot}
                opts={{ focusKey: `${label}-${slot}` }}
              >
                <MenuEntryButton
                  id={`save-state-${slot}`}
                  onClick={() => action(slot)}
                  className="flex gap-4 w-full items-start"
                >
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
                </MenuEntryButton>
              </FocusableElement>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
