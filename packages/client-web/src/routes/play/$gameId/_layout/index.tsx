import { cn } from "@retrom/ui/lib/utils";
import { useConfig } from "@/providers/config";
import {
  createFileRoute,
  useBlocker,
  useLocation,
} from "@tanstack/react-router";
import { cores } from "@/lib/emulatorjs";
import { z } from "zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmuJsFrameEvent } from "./frame.lazy";
import { useNavigate } from "@tanstack/react-router";
import { useGameDetail } from "@/providers/game-details";
import { useModalAction } from "@/providers/modal-action";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  coreName: z.enum(cores).optional(),
  confirmExit: z.boolean().optional(),
  overlay: z.boolean().optional(),
});

export const Route = createFileRoute("/play/$gameId/_layout/")({
  component: PlayComponent,
  validateSearch: zodValidator(searchSchema),
});

export type LastSynced = {
  save: Date | undefined;
  state: Date | undefined;
};

function PlayComponent() {
  const { game } = useGameDetail();
  const frame = useRef<HTMLIFrameElement>(null);
  const location = useLocation();
  const fullscreen = useConfig((s) => s.config?.interface?.fullscreenByDefault);
  const navigate = useNavigate();
  const { openModal } = useModalAction("confirmModal");
  const [lastSynced, setLastSynced] = useState<LastSynced>({
    save: undefined,
    state: undefined,
  });

  const { coreName } = Route.useSearch();
  const frameUrl = useMemo(
    () =>
      `${location.pathname}/frame${coreName ? `?coreName=${coreName}` : ""}`,
    [coreName, location.pathname],
  );

  const confirm = useCallback(async () => {
    const confirmed = new Promise<boolean>((resolve) => {
      openModal({
        title: "Are you sure you want to exit?",
        description: "You will lose any unsynced save data",
        content: (
          <div
            className={cn(
              "flex flex-col gap-4",
              "[&_h3]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground",
            )}
          >
            <div>
              <h3>Save file last synced:</h3>
              <p>
                {lastSynced.save
                  ? lastSynced.save.toLocaleString()
                  : "Not synced during this session"}
              </p>
            </div>

            <div>
              <h3>Save states last synced:</h3>
              <p>
                {lastSynced.state
                  ? lastSynced.state.toLocaleString()
                  : "Not synced during this session"}
              </p>
            </div>
          </div>
        ),
        onConfirm: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });

    return await confirmed;
  }, [lastSynced, openModal]);

  useBlocker({
    withResolver: true,
    shouldBlockFn: async ({ next }) => {
      if (next.pathname === location.pathname) {
        return false;
      }

      const confirmed = await confirm();
      return !confirmed;
    },
  });

  useEffect(() => {
    function onMessage(e: MessageEvent<EmuJsFrameEvent>) {
      switch (e.data) {
        case "exit": {
          navigate({
            ignoreBlocker: true,
            to: fullscreen
              ? `/fullscreen/games/${game.id}`
              : `/games/${game.id}`,
          }).catch(console.error);

          break;
        }
        case "save-synced": {
          setLastSynced((prev) => ({
            ...prev,
            save: new Date(),
          }));

          break;
        }
      }
    }

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [fullscreen, game.id, navigate]);

  return (
    <div className={cn("relative flex flex-col h-full")}>
      <div id="frame-container" className="relative h-full">
        <iframe
          ref={frame}
          allow="cross-origin-isolated"
          src={frameUrl}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
