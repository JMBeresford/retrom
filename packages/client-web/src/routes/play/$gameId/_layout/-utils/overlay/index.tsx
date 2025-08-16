import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  useSheetOpen,
} from "@retrom/ui/components/sheet";
import { getFileStub, Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import { FC, memo, ReactNode, useCallback, useMemo } from "react";
import { coreOptions } from "./core-options";
import { Hotkey, useHotkeys } from "@/providers/hotkeys";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { FocusContainer } from "@/components/fullscreen/focus-container";
import { gameOptions } from "./game-options";
import logo from "@/assets/img/Logo.png";
import logoLong from "@/assets/img/LogoLong-NoBackground-Small.png";
import { Separator } from "@retrom/ui/components/separator";
import { emulationOptions } from "./emulation-options";
import { HotkeyButton } from "@/components/fullscreen/hotkey-button";
import { controlOptions } from "./control-options";
import { HotkeyLayer, useFocusedHotkeyLayer } from "@/providers/hotkeys/layers";
import { useNavigate } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { useEmulatorJS } from "@/providers/emulator-js";
import { MenuItem, MenuItemGroup, MenuRoot } from "@/components/menubar";
import { Label } from "@retrom/ui/components/label";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { useEJSSessionState } from "@/providers/emulator-js/ejs-session";
import { configOptions } from "./config";
import { useControlOptions } from "@/providers/emulator-js/control-options";
import { createUrl, usePublicUrl } from "@/utils/urls";

export type OverlayMenuItem = Omit<MenuItem, "items" | "Render"> & {
  Render?: FC;
  items?: (OverlayMenuItem | OverlayMenuItemGroup)[];
  labelSub?: ReactNode;
};

export type OverlayMenuItemGroup = Omit<MenuItemGroup, "groupItems"> & {
  groupItems: OverlayMenuItem[];
};

export type OverlayMenuRoot = Omit<MenuRoot, "items"> & {
  items: (OverlayMenuItem | OverlayMenuItemGroup)[];
};

const overlayMenu: OverlayMenuRoot = {
  items: [
    {
      groupItems: [gameOptions, emulationOptions, coreOptions, controlOptions],
    },
    { groupItems: [configOptions, { label: "Exit Game", Render: ExitGame }] },
  ],
};

function OverlayMenuItem(props: { item: OverlayMenuItem }) {
  const { item } = props;
  const { Render, action, items, label, labelSub } = item;

  if (items) {
    return (
      <Sheet modal={false}>
        <SheetTrigger asChild>
          {Render ? (
            <Render />
          ) : (
            <MenuEntryButton label={labelSub} onClick={action}>
              {label}
            </MenuEntryButton>
          )}
        </SheetTrigger>

        <OverlayMenuSubMenu item={item} />
      </Sheet>
    );
  }

  if (Render) {
    return <Render />;
  }

  if (typeof label === "string") {
    return (
      <MenuEntryButton label={labelSub} onClick={action}>
        {label}
      </MenuEntryButton>
    );
  }

  return label;
}

function OverlayMenuSubMenu(props: { item: OverlayMenuItem }) {
  const {
    item: { items = [], label },
  } = props;
  const { setOpen } = useSheetOpen();
  const id = typeof label === "string" ? label : undefined;

  return (
    <SheetPortal container={document.getElementById("overlay-container")}>
      <SheetContent
        userCanClose
        className="absolute w-96 justify-start"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <SheetHeader className="px-3">
          <SheetTitle asChild={typeof label === "function"}>
            {typeof label === "function" ? <label /> : label}
          </SheetTitle>
          <SheetDescription>Settings related to {label}</SheetDescription>
          <Separator className="mx-auto mt-4" />
        </SheetHeader>

        <HotkeyLayer
          id={id}
          handlers={{
            BACK: {
              handler: () => setOpen(false),
              actionBar: { label: "Back", position: "left" },
            },
          }}
        >
          <FocusContainer
            className="flex flex-col overflow-hidden"
            opts={{
              initialFocus: true,
              focusKey: id,
              isFocusBoundary: true,
              forceFocus: true,
            }}
          >
            <ScrollArea className="flex flex-col">
              {items.map((sub, idx) =>
                "groupItems" in sub ? (
                  <OverlayMenuItemGroup key={idx} group={sub} />
                ) : (
                  <OverlayMenuItem key={idx} item={sub} />
                ),
              )}
            </ScrollArea>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </SheetPortal>
  );
}

function OverlayMenuItemGroup(props: { group: OverlayMenuItemGroup }) {
  const {
    group: { groupItems, label },
  } = props;

  return (
    <div className="pb-4 group">
      <div className="px-3 pb-2">
        {label ? (
          <Label className="py-2 text-muted-foreground font-semibold">
            {label}
          </Label>
        ) : null}

        <Separator className={cn("mx-auto", !label && "group-first:hidden")} />
      </div>

      {groupItems.map((item, idx) => (
        <OverlayMenuItem key={idx} item={item} />
      ))}
    </div>
  );
}

export const OverlayMenu = memo(function OverlayMenu(props: {
  core: string;
  name: string;
  platform: string;
  imgSrc: string;
}) {
  const { core, name, imgSrc, platform } = props;
  const emulatorJS = useEmulatorJS();
  const { pauseInput, resumeInput } = useControlOptions();
  const { open } = useSheetOpen();

  return (
    <SheetContent
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        resumeInput();
        emulatorJS.elements.parent.focus();
      }}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        pauseInput();
      }}
      className="absolute w-96"
      userCanClose
    >
      <SheetHeader className="px-3">
        <div className="flex flex-row gap-2">
          <Image src={imgSrc} className="w-16 min-w-0" />

          <div className="text-pretty w-fit">
            <SheetTitle className="font-black whitespace-nowrap overflow-hidden text-ellipsis">
              {name}
            </SheetTitle>
            <SheetDescription className="text-foreground text-base font-semibold mb-1">
              {platform}
            </SheetDescription>
            <SheetDescription>Emulating via {core}</SheetDescription>
          </div>
        </div>

        <Separator className="mx-auto mt-4" />
      </SheetHeader>

      <div className="flex flex-col h-full">
        <FocusContainer
          opts={{
            initialFocus: open,
            focusKey: "menu-root",
            isFocusBoundary: true,
            forceFocus: true,
          }}
        >
          <ScrollArea className="flex flex-col h-full">
            {overlayMenu.items.map((sub, idx) =>
              "groupItems" in sub ? (
                <OverlayMenuItemGroup key={idx} group={sub} />
              ) : (
                <OverlayMenuItem key={idx} item={sub} />
              ),
            )}
          </ScrollArea>
        </FocusContainer>
      </div>
    </SheetContent>
  );
});

/**
 * Hoist the 'useNavigate' and 'useEmulatorJS' hooks that
 * can lead to many re-renders to the top level. Render
 * the overlay contents as a memoized component within in order
 * to avoid these re-renders down the tree.
 */
export function Overlay() {
  const publicUrl = usePublicUrl();
  const { overlay } = useSearch({ strict: false });
  const emulatorJS = useEmulatorJS();
  const { pauseInput } = useControlOptions();
  const {
    name,
    gameMetadata,
    extraMetadata,
    emulator,
    platform,
    platformMetadata,
  } = useGameDetail();

  const coverUrl = useMemo(() => {
    const localPath = extraMetadata?.mediaPaths?.coverUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return gameMetadata?.coverUrl;
  }, [publicUrl, gameMetadata, extraMetadata]);

  const navigate = useNavigate();

  const open = !!overlay;

  useHotkeys({
    handlers: {
      MENU: { handler: () => toggleOpen(), actionBar: { label: "Open" } },
    },
  });

  const toggleOpen = useCallback(
    (value?: boolean) => {
      navigate({
        to: ".",
        search: (prev) => {
          const open = value ?? !prev.overlay;
          if (open) {
            pauseInput();
          } else {
            emulatorJS.elements.parent.focus();
          }

          return { ...prev, overlay: open };
        },
      }).catch(console.error);
    },
    [navigate, emulatorJS, pauseInput],
  );

  return (
    <Sheet open={open} onOpenChange={toggleOpen}>
      <div
        className={cn(
          "fixed inset-0 z-[90] grid grid-rows-[1fr_auto]",
          "transition-colors ease-in-out duration-200",
          open
            ? "bg-black/80 pointer-events-auto touch-auto"
            : "bg-transparent pointer-events-none touch-none",
        )}
      >
        <HotkeyLayer
          id="menu-root"
          allowBubbling="never"
          handlers={{
            BACK: {
              handler: () => toggleOpen(false),
            },
            MENU: {
              handler: () => toggleOpen(false),
            },
          }}
        >
          <div id="overlay-container" className="relative w-fit">
            <OverlayMenu
              core={emulator?.name ?? emulatorJS.coreName}
              name={name}
              platform={platformMetadata?.name ?? getFileStub(platform.path)}
              imgSrc={coverUrl || logo}
            />
          </div>
        </HotkeyLayer>

        <div
          className={cn(
            "hidden sm:flex bg-background h-min border-t",
            "py-2 fill-mode-both",
            "slide-in-from-bottom fade-in slide-out-to-bottom fade-out",
            open ? "animate-in " : "animate-out ",
          )}
        >
          <ActionBar />
        </div>
      </div>
    </Sheet>
  );
}

function ExitGame() {
  const { handleExit, saveSaveFile } = useEJSSessionState();

  return (
    <MenuEntryButton
      onClick={async () => {
        await saveSaveFile();
        handleExit().catch(console.error);
      }}
      label="Return to your Retrom library"
    >
      Exit Game
    </MenuEntryButton>
  );
}

function ActionBar() {
  const { focusedHotkeyLayer } = useFocusedHotkeyLayer();

  const hotkeys = useMemo(() => {
    function getActiveHotkey(hotkey: Hotkey) {
      let layer = focusedHotkeyLayer;
      while (layer) {
        if (layer.handlers?.[hotkey]) {
          return layer.handlers[hotkey];
        }

        layer = layer.parentLayer;
      }
    }

    const hotkeys = Hotkey.flatMap((hotkey) => {
      const handler = getActiveHotkey(hotkey);

      return handler ? [{ hotkey, handler }] : [];
    }).concat([
      {
        hotkey: "MENU",
        handler: { actionBar: { label: "Close Menu", position: "left" } },
      },
    ]);

    return {
      left: hotkeys.filter((h) => h.handler.actionBar?.position === "left"),
      right: hotkeys.filter((h) => h.handler.actionBar?.position !== "left"),
    };
  }, [focusedHotkeyLayer]);

  return (
    <div className="grid grid-cols-3 gap-2 w-full h-full">
      <div className="flex gap-2">
        {hotkeys.left.map(({ hotkey, handler }) => {
          const { label } = handler?.actionBar ?? {};

          if (!label) {
            return null;
          }

          return (
            <HotkeyButton key={hotkey} hotkey={hotkey}>
              {label}
            </HotkeyButton>
          );
        })}
      </div>

      <Image
        src={logoLong}
        className="h-5 col-start-2 row-start-1 place-self-center"
      />

      <div className="flex gap-2 justify-end">
        {hotkeys.right.map(({ hotkey, handler }) => {
          const { label } = handler?.actionBar ?? {};

          if (!label) {
            return null;
          }

          return (
            <HotkeyButton key={hotkey} hotkey={hotkey}>
              {label}
            </HotkeyButton>
          );
        })}
      </div>
    </div>
  );
}
