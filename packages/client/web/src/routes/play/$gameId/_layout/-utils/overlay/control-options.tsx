import { FocusContainer } from "@/components/fullscreen/focus-container";
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
import { EmulatorJSControlMap } from "@/lib/emulatorjs/gamepad";
import { cn, toTitleCase } from "@/lib/utils";
import {
  Player,
  useControlOptions,
  usePlayerControls,
} from "@/providers/emulator-js/control-options";
import {
  GAMEPAD_BUTTON_EVENT,
  GamepadButtonEvent,
} from "@/providers/gamepad/event";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { Keyboard, Gamepad2 } from "lucide-react";
import {
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Tab = Player | "reset";

const { Player1, Player2, Player3, Player4 } = Player;
const PlayerList = [Player1, Player2, Player3, Player4];

export function ControlOptions() {
  const { resetControls } = useControlOptions();
  const [tab, setTab] = useState<Tab | undefined>(undefined);

  const { open: parentOpen } = useSheetOpen();
  return (
    <div className="relative flex h-full">
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
          {PlayerList.map((player) => {
            return (
              <MenuEntryButton
                key={player}
                id={`control-options-tab-${player}`}
                className="text-base"
                data-state={tab === player ? "active" : undefined}
                onFocus={() => setTab(player)}
                onClick={() => setTab(player)}
              >
                Player {Number(player) + 1}
              </MenuEntryButton>
            );
          })}

          <Separator className="w-4/5 mx-auto my-2" />

          <MenuEntryButton
            id="control-options-reset"
            className="text-base"
            onClick={() => resetControls()}
            onFocus={() => setTab("reset")}
          >
            Reset Controls
          </MenuEntryButton>
        </div>
      </FocusContainer>

      {PlayerList.map((player) => {
        const open = tab === player && parentOpen;

        return (
          <Sheet modal={false} key={player} open={open}>
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
                <SheetTitle>Player {player}</SheetTitle>
                <SheetDescription>
                  Control settings for player {player}
                </SheetDescription>
              </SheetHeader>
              <ScrollArea
                className={cn(
                  "relative flex flex-col",
                  "transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
                )}
              >
                <HotkeyLayer id={`control-bindings-${player}`}>
                  <FocusContainer
                    opts={{
                      focusable: open,
                      focusKey: `control-options-${player}`,
                    }}
                    onFocus={(e) =>
                      e.target.scrollIntoView({ block: "center" })
                    }
                    className={cn(
                      "grid grid-cols-[auto,1fr,1fr] auto-rows-fr w-max h-full",
                    )}
                  >
                    <PlayerBindings player={player} />
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
    </div>
  );
}

function PlayerBindings(props: { player: Player }) {
  const { player } = props;
  const { labels } = useControlOptions();

  return (
    <>
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
        const buttonId = id as keyof EmulatorJSControlMap;

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

            <RecordInput player={player} buttonId={buttonId} />
            <RecordInput player={player} buttonId={buttonId} gamepad />
          </div>
        );
      })}
    </>
  );
}

const RecordInput = memo(function RecordInput(props: {
  player: Player;
  buttonId: keyof EmulatorJSControlMap;
  gamepad?: boolean;
}) {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const { player, buttonId, gamepad } = props;
  const { setBindings, keyLookup, getKeyLabel, getButtonLabel } =
    useControlOptions();
  const bindings = usePlayerControls(player);

  const value = useMemo(() => {
    const values = bindings[buttonId];

    if (gamepad) {
      return values?.value2 ?? "";
    }

    return values?.value !== undefined
      ? getKeyLabel(values.value).toString()
      : "";
  }, [bindings, buttonId, gamepad, getKeyLabel]);

  const setBinding = useCallback(
    (value: string) => {
      const key = gamepad ? "value2" : "value";

      return setBindings(player, { [buttonId]: { [key]: value } });
    },
    [gamepad, setBindings, buttonId, player],
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!recording || gamepad) return;
      e.preventDefault();
      e.stopPropagation();

      setRecording(false);
      let binding = "";
      switch (e.key.toLowerCase()) {
        case " ":
          binding = "Space";
          break;
        case "meta":
          binding =
            e.code.toLowerCase() === "metaleft"
              ? "left window key"
              : "right window key";
          break;
        default:
          binding = e.key;
          break;
      }

      const ejsKey = Number(keyLookup(binding));
      if (ejsKey > 0) {
        setBinding(binding);
      } else {
        toast({
          title: "Invalid key",
          description: "Please select a different key",
          variant: "destructive",
        });
      }
    },
    [recording, setBinding, gamepad, toast, keyLookup],
  );

  const handleGamepad = useCallback(
    (e: GamepadButtonEvent) => {
      if (!gamepad) return;
      const { button } = e.detail;
      if (!e.detail.gamepad.buttons[button]?.pressed) return;

      const label = getButtonLabel(button);
      if (label) {
        setBinding(label);
      }
      setRecording(false);
    },
    [gamepad, setBinding, getButtonLabel],
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

  const record = useCallback(() => {
    if (recording) return;
    setRecording(true);
  }, [recording]);

  return (
    <MenuEntryButton
      id={id}
      handlers={{
        ACCEPT: {
          handler: record,
          label: "Record",
        },
      }}
      onClick={record}
      onBlur={() => {
        setRecording(false);
      }}
      onKeyDown={handleKey}
      className={cn(
        "text-base font-normal items-center pr-3 h-full",
        recording && "text-accent-text text-sm italic animate-pulse",
      )}
    >
      {recording ? "recording..." : label || "-"}
    </MenuEntryButton>
  );
});
