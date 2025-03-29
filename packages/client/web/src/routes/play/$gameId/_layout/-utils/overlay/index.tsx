import {
  Sheet,
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
import { ReactNode, useCallback, useState } from "react";
import { CoreOptions } from "./core-options";
import { useHotkeys } from "@/providers/hotkeys";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import {
  FocusableElement,
  FocusContainer,
} from "@/components/fullscreen/focus-container";
import { GameOptions } from "./game-options";
import logo from "@/assets/img/LogoLong-NoBackground-Small.png";
import { Separator } from "@/components/ui/separator";
import { EmulationOptions } from "./emulation-options";
import { HotkeyButton } from "@/components/fullscreen/hotkey-button";
import { ControlOptions } from "./control-options";
import { pause, resume } from "@noriginmedia/norigin-spatial-navigation";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useNavigate } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { useEmulatorJS } from "@/providers/emulator-js";

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

export function Overlay() {
  const { emulatorJS } = useEmulatorJS();
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
      Content: (props) => <GameOptions {...props} />,
    },
    emulationOptions: {
      Trigger: "Emulation Options",
      Content: (props) => <EmulationOptions {...props} />,
    },
    coreOptions: {
      Trigger: "Core Options",
      Content: () => <CoreOptions />,
    },
    controlOptions: {
      Trigger: "Control Options",
      Content: () => <ControlOptions />,
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
          }

          return { ...prev, overlay: open };
        },
      }).catch(console.error);
    },
    [navigate],
  );

  return (
    <Sheet open={!!overlay} onOpenChange={toggleOpen}>
      <SheetPortal>
        <SheetOverlay onClick={(e) => console.log(e)} />
        <SheetContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
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

          <div className="flex w-min h-full">
            <FocusContainer
              initialFocus
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
                    <FocusableElement
                      key={key}
                      opts={{ focusKey: `overlay-menu-root-${key}` }}
                    >
                      <MenuEntryButton
                        data-state={key === tab ? "active" : undefined}
                        onClick={opts.action}
                        onFocus={() => setTab(key as Tab)}
                      >
                        {opts.Trigger}
                      </MenuEntryButton>
                    </FocusableElement>
                  ))}
                </div>
              </HotkeyLayer>
            </FocusContainer>

            <div className={cn("relative flex h-full")}>
              {emulatorJS ? (
                <>
                  {Object.entries(tabs).map(([key, opts]) => (
                    <Sheet modal={false} key={key} open={tab === (key as Tab)}>
                      {"Content" in opts ? (
                        <SheetContent
                          key={key}
                          className={cn(
                            "absolute z-[-1] bg-transparent",
                            "border-none shadow-none group fill-mode-both",
                            tab === (key as Tab)
                              ? "delay-200"
                              : "has-data-[state=open]:delay-200 delay-0",
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

                          {opts.Content ? (
                            <opts.Content emulatorJS={emulatorJS} />
                          ) : null}
                        </SheetContent>
                      ) : (
                        <></>
                      )}
                    </Sheet>
                  ))}
                </>
              ) : null}
            </div>
          </div>

          <SheetFooter
            className={cn("flex w-full justify-between bg-background")}
          >
            <HotkeyButton hotkey="MENU">Close</HotkeyButton>

            <div className="flex gap-2">
              <HotkeyButton hotkey="ACCEPT">Accept</HotkeyButton>
              <HotkeyButton hotkey="BACK">Back</HotkeyButton>
            </div>
          </SheetFooter>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
