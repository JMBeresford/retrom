import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import { cn, Image } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import { memo, ReactNode, useCallback, useState } from "react";
import { CoreOptions } from "./core-options";
import { Hotkey, useHotkeys } from "@/providers/hotkeys";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { FocusContainer } from "@/components/fullscreen/focus-container";
import { GameOptions } from "./game-options";
import logo from "@/assets/img/LogoLong-NoBackground-Small.png";
import { Separator } from "@/components/ui/separator";
import { EmulationOptions } from "./emulation-options";
import { HotkeyButton } from "@/components/fullscreen/hotkey-button";
import { ControlOptions } from "./control-options";
import {
  pause,
  resume,
  setFocus,
} from "@noriginmedia/norigin-spatial-navigation";
import { HotkeyLayer, useFocusedHotkeyLayer } from "@/providers/hotkeys/layers";
import { useNavigate } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { useEmulatorJS } from "@/providers/emulator-js";
import { ControlOptionsProvider } from "@/providers/emulator-js/control-options";
import { CoreOptionsProvider } from "@/providers/emulator-js/core-options";

const ControlOptionsMemo = memo(ControlOptions);
const CoreOptionsMemo = memo(CoreOptions);

type Tab =
  | "gameOptions"
  | "emulationOptions"
  | "coreOptions"
  | "controlOptions"
  | "exitGame";

type TabOpts = {
  Trigger: ReactNode;
  action?: () => void | Promise<void>;
  Content?: (props: { emulatorJS: EmulatorJS }) => ReactNode;
};

export const Overlay = memo(function Overlay() {
  const emulatorJS = useEmulatorJS();
  const { name } = useGameDetail();
  const { overlay } = useSearch({ strict: false });
  const [tab, setTab] = useState<Tab | undefined>(undefined);
  const navigate = useNavigate();

  useHotkeys({
    handlers: {
      MENU: { handler: () => toggleOpen() },
    },
  });

  const tabs: Record<Tab, TabOpts> = {
    gameOptions: {
      Trigger: "Game Options",
      Content: () => <GameOptions />,
    },
    emulationOptions: {
      Trigger: "Emulation Options",
      Content: () => <EmulationOptions />,
    },
    coreOptions: {
      Trigger: "Core Options",
      Content: () => (
        <CoreOptionsProvider>
          <CoreOptionsMemo />
        </CoreOptionsProvider>
      ),
    },
    controlOptions: {
      Trigger: "Control Options",
      Content: () => (
        <ControlOptionsProvider>
          <ControlOptionsMemo />
        </ControlOptionsProvider>
      ),
    },
    exitGame: {
      Trigger: "Exit Game",
      action: () => {
        emulatorJS?.callEvent("exit", {});
      },
    },
  };

  const toggleOpen = useCallback(
    (value?: boolean) => {
      navigate({
        to: ".",
        search: (prev) => {
          const open = value ?? !prev.overlay;
          if (open) {
            resume();
          } else {
            pause();
            emulatorJS.elements.parent.focus();
          }

          return { ...prev, overlay: open };
        },
      }).catch(console.error);
    },
    [navigate, emulatorJS],
  );

  return (
    <Sheet open={!!overlay} onOpenChange={toggleOpen}>
      <SheetPortal>
        <SheetOverlay />
        <SheetContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            setFocus("menu-root");
          }}
          className={cn(
            "fixed inset-0 sm:max-w-screen flex flex-col",
            "bg-transparent outline-none border-none gap-0",
            "data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-left-0",
            "data-[state=open]:fade-in data-[state=closed]:fade-out",
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{name}</SheetTitle>
            <SheetDescription>
              Emulating via {emulatorJS?.config.core}
            </SheetDescription>
          </SheetHeader>
          <FocusContainer
            className="contents"
            opts={{ focusKey: "overlay", isFocusBoundary: true }}
          >
            <div className="flex w-min h-full">
              <FocusContainer
                className={cn(
                  "flex flex-col h-full relative w-min bg-background border-r py-6",
                )}
                opts={{
                  focusKey: "menu-root",
                  forceFocus: true,
                }}
              >
                <div className="">
                  <Image src={logo} className="w-fit min-w-0 pb-2 px-4" />
                </div>

                <Separator className="w-4/5 mx-auto my-2" />

                <HotkeyLayer id="menu-root">
                  <div
                    className={cn(
                      "flex flex-col justify-start w-max h-full",
                      "transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
                    )}
                  >
                    {Object.entries(tabs).map(([key, opts]) => (
                      <MenuEntryButton
                        key={key}
                        id={`overlay-menu-root-${key}`}
                        data-state={key === tab ? "active" : undefined}
                        onClick={
                          opts.action ? opts.action : () => setTab(key as Tab)
                        }
                        onFocus={() => setTab(key as Tab)}
                      >
                        {opts.Trigger}
                      </MenuEntryButton>
                    ))}
                  </div>
                </HotkeyLayer>
              </FocusContainer>

              <div className={cn("relative flex h-full")}>
                {Object.entries(tabs).map(([key, opts]) => {
                  const focusKey = `overlay-${key}-root`;
                  const open = tab === key;

                  return (
                    <Sheet modal={false} key={key} open={open}>
                      {"Content" in opts ? (
                        <SheetContent
                          key={key}
                          className={cn(
                            "absolute z-[-1] bg-transparent",
                            "border-none shadow-none group fill-mode-both",
                          )}
                          onCloseAutoFocus={(e) => {
                            e.preventDefault();
                          }}
                          onOpenAutoFocus={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <SheetHeader className="sr-only">
                            <SheetTitle>{key} tab</SheetTitle>
                            <SheetDescription>
                              Settings related to {key}
                            </SheetDescription>
                          </SheetHeader>

                          <FocusContainer
                            className="flex h-full"
                            opts={{
                              focusKey,
                              focusable: open,
                            }}
                          >
                            {opts.Content ? (
                              <opts.Content emulatorJS={emulatorJS} />
                            ) : null}
                          </FocusContainer>
                        </SheetContent>
                      ) : (
                        <></>
                      )}
                    </Sheet>
                  );
                })}
              </div>
            </div>
          </FocusContainer>

          <SheetFooter
            className={cn("flex w-full justify-between bg-background")}
          >
            <SheetClose asChild>
              <HotkeyButton hotkey="MENU">Close</HotkeyButton>
            </SheetClose>

            <ActionBar />
          </SheetFooter>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
});

function ActionBar() {
  const { focusedHotkeyLayer } = useFocusedHotkeyLayer();

  const getActiveHotkey = useCallback(
    (hotkey: Hotkey) => {
      let layer = focusedHotkeyLayer;
      while (layer) {
        if (layer.handlers?.[hotkey]) {
          return layer.handlers?.[hotkey];
        }

        layer = layer.parentLayer;
      }
    },
    [focusedHotkeyLayer],
  );
  return (
    <div className="flex gap-2">
      {Hotkey.map((hotkey) => {
        const handler = getActiveHotkey(hotkey);

        return handler?.label ? (
          <HotkeyButton key={hotkey} hotkey={hotkey}>
            {handler.label}
          </HotkeyButton>
        ) : null;
      })}
      {/* <HotkeyButton hotkey="ACCEPT">Accept</HotkeyButton> */}
      {/* <HotkeyButton hotkey="BACK">Back</HotkeyButton> */}
    </div>
  );
}
