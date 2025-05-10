import { MenuItem } from "@/components/menubar";
import { useEmulatorJS } from "@/providers/emulator-js";
import { useGameDetail } from "@/providers/game-details";
import { useEJSSaveState } from "@/queries/emulator-js/useEJSSaveState";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useRemoteFiles } from "../../useRemoteFiles";
import { useSaveEJSState } from "@/mutations/emulator-js/useSaveEJSState";
import { useLoadEJSState } from "@/mutations/emulator-js/useLoadEJSState";
import { useImportEJSState } from "@/mutations/emulator-js/useImportEJSState";
import { useExportEJSState } from "@/mutations/emulator-js/useExportEJSState";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { cn, Image, timestampToDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { HotkeyIcon } from "@/components/fullscreen/hotkey-button";
import { EllipsisVertical } from "lucide-react";
import { FocusContainer } from "@/components/fullscreen/focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";

export const saveStateList: MenuItem = {
  label: "Save State",
  items: [{ Render: <StateList listKind="save" /> }],
};

export const loadStateList: MenuItem = {
  label: "Load State",
  items: [{ Render: <StateList listKind="load" /> }],
};

const Slots = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function StateList(props: { listKind: "save" | "load" }) {
  const { listKind } = props;
  const label = listKind === "save" ? "save-state" : "load-state";
  const { game } = useGameDetail();

  function Slot(props: { slot: number }) {
    const { slot } = props;
    const emulatorJS = useEmulatorJS();
    const { data: info, refetch } = useEJSSaveState(slot, game.id);
    const { screenshot, stat } = info ?? {};
    const id = `${label}-${slot}`;
    const [optsOpen, setOptsOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const { getPublicUrl, deleteFiles } = useRemoteFiles();

    const { mutateAsync: saveState } = useSaveEJSState();
    const { mutateAsync: loadState } = useLoadEJSState();
    const { mutateAsync: importSaveState } = useImportEJSState();
    const exportSaveState = useExportEJSState();

    const disabled = listKind === "load" && info?.state === undefined;

    const action = useCallback(async () => {
      if (listKind === "save") {
        await saveState({ slot, core: emulatorJS.coreName, gameId: game.id });
      } else {
        await loadState({ slot, core: emulatorJS.coreName, gameId: game.id });
      }

      return navigate({
        to: ".",
        search: (prev) => ({ ...prev, overlay: false }),
      }).catch(console.error);
    }, [slot, emulatorJS, saveState, loadState, navigate]);

    const remoteAction = useCallback(async () => {
      if (listKind === "save") {
        await importSaveState({
          slot,
          core: emulatorJS.coreName,
          gameId: game.id,
        });
      } else {
        if (info) {
          exportSaveState({ stateInfo: info });
        }
      }
    }, [slot, emulatorJS, info, importSaveState, exportSaveState]);

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
    }, [deleteFiles, stat, navigate, refetch]);

    return (
      <DropdownMenu open={optsOpen} onOpenChange={setOptsOpen}>
        <MenuEntryButton
          id={id}
          ref={ref}
          onClick={() => (disabled ? null : action())}
          className="flex group relative pr-4"
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
            className="p-0 [&_button]:py-3 [&_button]:pl-4 z-[100]"
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
    <div className="flex flex-col w-full">
      {Slots.map((slot) => (
        <Slot key={slot} slot={slot} />
      ))}
    </div>
  );
}
