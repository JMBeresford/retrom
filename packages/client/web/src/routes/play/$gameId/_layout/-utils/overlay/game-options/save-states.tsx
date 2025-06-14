import { useEmulatorJS } from "@/providers/emulator-js";
import { useGameDetail } from "@/providers/game-details";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useSaveEJSState } from "@/mutations/emulator-js/useSaveEJSState";
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
import { OverlayMenuItem } from "..";
import { useGetSaveStates } from "@/queries/saveStates";
import { File } from "@retrom/codegen/retrom/files_pb";
import { useDeleteSaveStates } from "@/mutations/saveStates";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer_pb";
import { uInt8ToBase64 } from "@/utils/binary";

export const saveStateList: OverlayMenuItem = {
  label: "Save State",
  items: [{ Render: () => <StateList listKind="save" /> }],
};

export const loadStateList: OverlayMenuItem = {
  label: "Load State",
  items: [{ Render: () => <StateList listKind="load" /> }],
};

const Slots = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function StateList(props: { listKind: "save" | "load" }) {
  const { listKind } = props;
  const label = listKind === "save" ? "save-state" : "load-state";
  const emulatorJS = useEmulatorJS();
  const { game, emulator } = useGameDetail();
  const { mutateAsync: deleteStates } = useDeleteSaveStates();

  const loadState = useCallback(
    (opts: { state: File; slot: number }) => {
      const { state, slot } = opts;
      emulatorJS.changeSettingOption("save-state-slot", slot.toString());
      emulatorJS.gameManager?.loadState(state.content);
    },
    [emulatorJS],
  );

  function Slot(props: { slot: number }) {
    const { slot } = props;
    const { data: info, refetch } = useGetSaveStates({
      saveStatesSelectors: [{ gameId: game.id, emulatorId: emulator?.id }],
    });

    const state = info?.saveStates
      .flatMap((s) => s.files)
      .find((f) => f.stat?.path === `${slot}.state`);

    const screenshot = info?.saveStates
      .flatMap((s) => s.files)
      .find((f) => f.stat?.path === `${slot}.png`);

    const id = `${label}-${slot}`;
    const [optsOpen, setOptsOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    const { mutateAsync: saveState } = useSaveEJSState();
    const { mutateAsync: importSaveState } = useImportEJSState();
    const exportSaveState = useExportEJSState();

    const disabled = listKind === "load" && state === undefined;

    const action = useCallback(async () => {
      if (listKind === "save") {
        if (emulator) {
          await saveState({ slot, emulatorId: emulator.id, gameId: game.id });
        }
      } else {
        if (state) {
          loadState({ slot, state });
        }
      }

      return navigate({
        to: ".",
        search: (prev) => ({ ...prev, overlay: false }),
      }).catch(console.error);
    }, [slot, saveState, navigate, state]);

    const remoteAction = useCallback(async () => {
      if (listKind === "save") {
        if (emulator) {
          await importSaveState({
            slot,
            emulatorId: emulator.id,
            gameId: game.id,
          });
        }
      } else {
        if (state) {
          exportSaveState({ state });
        }
      }
    }, [slot, state, importSaveState, exportSaveState]);

    const deleteState = useCallback(async () => {
      await deleteStates({
        saveStatesSelectors: [
          {
            gameId: game.id,
            emulatorId: emulator?.id,
            files: [
              { path: `${slot}.state`, nodeType: FilesystemNodeType.FILE },
              { path: `${slot}.png`, nodeType: FilesystemNodeType.FILE },
            ],
          },
        ],
      });

      toast({
        title: "State deleted",
        description: "State has been deleted successfully",
      });

      refetch().catch(console.error);

      return navigate({
        to: ".",
        search: (prev) => ({ ...prev, overlay: false }),
      }).catch(console.error);
    }, [slot, navigate, refetch]);

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
              actionBar: {
                label: "Options",
              },
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
                <Image
                  src={`data:image/png;base64,${uInt8ToBase64(screenshot.content)}`}
                />
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
                {state?.stat
                  ? timestampToDate(state.stat.updatedAt).toLocaleString()
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
            className="p-0 [&_button]:py-3 [&_button]:px-4 z-[100]"
          >
            <HotkeyLayer
              id={id + "-options"}
              handlers={{
                BACK: {
                  handler: () => setOptsOpen(false),
                  actionBar: { label: "Close" },
                },
              }}
            >
              <DropdownMenuItem asChild>
                <MenuEntryButton
                  focusOpts={{ initialFocus: true }}
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
                  disabled={!state}
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
