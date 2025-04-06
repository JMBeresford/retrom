import {
  FocusableElement,
  FocusContainer,
} from "@/components/fullscreen/focus-container";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  useSheetOpen,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { EJSControls, EmulatorJSControlMap } from "@/lib/emulatorjs/gamepad";
import { cn, toTitleCase } from "@/lib/utils";
import { useEmulatorJS } from "@/providers/emulator-js";
import {
  GAMEPAD_BUTTON_EVENT,
  GamepadButtonEvent,
} from "@/providers/gamepad/event";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { Keyboard, Gamepad2 } from "lucide-react";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Player = `${keyof EJSControls}`;
type Tab = Player | "reset";

export function ControlOptions() {
  const { controlOptions, emulatorJS } = useEmulatorJS();
  const { bindings, setBindings, resetControls, labels } = controlOptions;
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab | undefined>(undefined);

  const { open: parentOpen } = useSheetOpen();

  return (
    <div className="relative flex h-full">
      <FocusContainer
        className="flex flex-col h-full"
        opts={{
          focusKey: "control-options-root",
          onBlur: () => setTab(undefined),
        }}
      >
        <FocusContainer
          className={cn("flex h-full w-min border-r bg-background")}
          opts={{
            focusKey: "control-options-tabs",
          }}
        >
          <div
            className={cn(
              "flex flex-col h-full w-max min-w-48",
              "py-6 transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
            )}
          >
            {Object.keys(bindings).map((player) => {
              return (
                <FocusableElement
                  key={player}
                  opts={{ focusKey: `control-options-tab-${player}` }}
                >
                  <MenuEntryButton
                    className="text-base"
                    data-state={tab === player ? "active" : undefined}
                    onFocus={() => setTab(player as Player)}
                  >
                    Player {Number(player) + 1}
                  </MenuEntryButton>
                </FocusableElement>
              );
            })}

            <Separator className="w-4/5 mx-auto my-2" />

            <FocusableElement opts={{ focusKey: "control-options-reset" }}>
              <MenuEntryButton
                className="text-base"
                onClick={resetControls}
                onFocus={() => setTab("reset")}
              >
                Reset Controls
              </MenuEntryButton>
            </FocusableElement>
          </div>
        </FocusContainer>

        {Object.keys(bindings).map((key) => {
          const playerIdx = key as Player;
          const control = bindings[playerIdx];

          const open = tab === playerIdx && parentOpen;

          return (
            <Sheet modal={false} key={key} open={open}>
              <SheetContent
                className={cn(
                  "absolute left-full inset-y-0 z-[-1] py-6 flex flex-col",
                  "fill-mode-both",
                )}
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                }}
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                }}
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Player {playerIdx}</SheetTitle>
                  <SheetDescription>
                    Control settings for player {playerIdx}
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea
                  className={cn(
                    "relative flex flex-col",
                    "transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
                  )}
                >
                  <HotkeyLayer id={`control-bindings-${playerIdx}`}>
                    <FocusContainer
                      opts={{
                        focusable: open,
                        focusKey: `control-options-${playerIdx}`,
                      }}
                      onFocus={(e) =>
                        e.target.scrollIntoView({ block: "center" })
                      }
                      className={cn(
                        "grid grid-cols-[auto,1fr,1fr] auto-rows-fr w-max h-full",
                      )}
                    >
                      <div
                        className={cn(
                          "grid grid-cols-subgrid grid-rows-subgrid col-span-3",
                          "pb-2 border-b",
                          "*:text-lg *:font-medium *:pl-3",
                          "*:flex *:items-center *:min-w-24",
                        )}
                      >
                        <Label>Button</Label>
                        <Label>
                          <Keyboard />
                        </Label>
                        <Label>
                          <Gamepad2 />
                        </Label>
                      </div>

                      {labels.map(({ id, label }) => {
                        const buttonId = Number(
                          id,
                        ) as keyof EmulatorJSControlMap;

                        const controlConfig = control[buttonId];
                        const { value, value2 } = controlConfig ?? {};

                        return (
                          <div
                            key={id}
                            className={cn(
                              "grid grid-cols-subgrid grid-rows-subgrid col-span-3 items-baseline",
                              "even:bg-white/[0.015] *:pt-0 items-stretch pr-2",
                            )}
                          >
                            <div className="border-r px-4 flex items-center">
                              <p className="text-sm text-muted-foreground font-medium">
                                {toTitleCase(label)}
                              </p>
                            </div>
                            <RecordInput
                              player={playerIdx}
                              buttonId={buttonId}
                              value={value ? emulatorJS.keyMap[value] : ""}
                              setControl={(value) => {
                                const ejsKey = Number(
                                  emulatorJS.keyLookup(value),
                                );
                                if (ejsKey > 0) {
                                  setBindings((prev) => {
                                    const next = {
                                      ...prev,
                                      [playerIdx]: {
                                        ...prev[playerIdx],
                                        [buttonId]: {
                                          value: ejsKey,
                                          value2:
                                            prev[playerIdx]?.[buttonId]?.value2,
                                        },
                                      },
                                    };

                                    emulatorJS.controls = next;
                                    return next;
                                  });
                                } else {
                                  toast({
                                    title: "Invalid key",
                                    description:
                                      "Please select a different key",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            />
                            <RecordInput
                              player={playerIdx}
                              buttonId={buttonId}
                              value={value2 ?? ""}
                              gamepad
                              setControl={(value) => {
                                setBindings((prev) => {
                                  const next = {
                                    ...prev,
                                    [playerIdx]: {
                                      ...prev[playerIdx],
                                      [buttonId]: {
                                        value2: value,
                                        value:
                                          prev[playerIdx]?.[buttonId]?.value,
                                      },
                                    },
                                  };

                                  emulatorJS.controls = next;
                                  return next;
                                });
                              }}
                            />
                          </div>
                        );
                      })}
                    </FocusContainer>
                  </HotkeyLayer>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          );
        })}

        <Sheet modal={false} open={tab === "reset"}>
          <SheetContent
            className={cn(
              "absolute left-full inset-y-0 z-[-1] py-6 flex flex-col",
              "fill-mode-both",
            )}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <SheetHeader className="px-4 w-min">
              <SheetTitle className="whitespace-nowrap w-min">
                Reset Controls
              </SheetTitle>
              <SheetDescription className="min-w-[27ch] max-w-[35ch] break-word">
                This will reset all controls to their default values
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </FocusContainer>
    </div>
  );
}

function RecordInput(
  props: {
    player: Player;
    buttonId: keyof EmulatorJSControlMap;
    value: string;
  } & (
    | { setControl: (value: string | number) => void; gamepad?: never }
    | { setControl: (value: string) => void; gamepad: true }
  ),
) {
  const [recording, setRecording] = useState(false);
  const { emulatorJS } = useEmulatorJS();
  const { player, buttonId, value, setControl, gamepad } = props;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!recording || gamepad) return;
      e.preventDefault();
      e.stopPropagation();

      setRecording(false);
      switch (e.key.toLowerCase()) {
        case " ":
          return setControl("Space");
        case "meta":
          return setControl(
            e.code.toLowerCase() === "metaleft"
              ? "left window key"
              : "right window key",
          );
        default:
          return setControl(e.key);
      }
    },
    [recording, setControl, gamepad],
  );

  const resetEJSGamepad = useCallback(() => {
    emulatorJS.gamepad.on(
      "axischanged",
      emulatorJS.gamepadEvent.bind(emulatorJS),
    );
    emulatorJS.gamepad.on(
      "buttondown",
      emulatorJS.gamepadEvent.bind(emulatorJS),
    );
  }, [emulatorJS]);

  const handleGamepad = useCallback(
    (e: GamepadButtonEvent) => {
      if (!gamepad) return;
      const { button } = e.detail;
      if (!e.detail.gamepad.buttons[button]?.pressed) return;

      const label = emulatorJS.gamepad.getButtonLabel(button) as string;
      console.log(label);
      if (label) {
        setControl(label);
      }
      setRecording(false);
    },
    [gamepad, setControl, emulatorJS],
  );

  useEffect(() => {
    if (recording) {
      window.addEventListener(GAMEPAD_BUTTON_EVENT, handleGamepad);
    } else {
      window.removeEventListener(GAMEPAD_BUTTON_EVENT, handleGamepad);
    }

    return () => {
      window.removeEventListener(GAMEPAD_BUTTON_EVENT, handleGamepad);
    };
  }, [handleGamepad, recording]);

  const label = useMemo(() => toTitleCase(value.replaceAll("_", " ")), [value]);
  const id = `key-recorder-${player}-${buttonId}${gamepad ? "-gamepad" : ""}`;

  return (
    <FocusableElement
      opts={{
        focusKey: id,
      }}
    >
      <MenuEntryButton
        id={id}
        handlers={recording ? { ACCEPT: { handler: undefined } } : undefined}
        onClick={() => {
          if (recording) return;
          setRecording(true);
        }}
        onBlur={() => {
          setRecording(false);
          resetEJSGamepad();
        }}
        onKeyDown={handleKey}
        className={cn(
          "text-base font-normal items-center pr-3 h-full",
          recording && "text-accent-text text-sm italic animate-pulse",
        )}
      >
        {recording ? "recording..." : label || "-"}
      </MenuEntryButton>
    </FocusableElement>
  );
}
