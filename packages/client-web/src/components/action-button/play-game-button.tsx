import { Button } from "@retrom/ui/components/button";
import { usePlayGame } from "@/mutations/usePlayGame";
import { usePlayStatusQuery } from "@/queries/usePlayStatus";
import {
  PlayGamePayload,
  PlayStatus,
} from "@retrom/codegen/retrom/client/client-utils_pb";
import { useStopGame } from "@/mutations/useStopGame";
import {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import { LoaderCircleIcon, PlayIcon, PlusIcon, Square } from "lucide-react";
import { useMatch, useNavigate } from "@tanstack/react-router";
import { toast } from "@retrom/ui/hooks/use-toast";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { useDefaultEmulator } from "@/queries/useDefaultEmulator";
import { useGameFiles } from "@/queries/useGameFiles";
import { useMutation } from "@tanstack/react-query";
import { checkIsDesktop } from "@/lib/env";
import { match } from "ts-pattern";
import {
  SaveSyncStatus,
  SyncBehavior,
} from "@retrom/codegen/retrom/client/saves_pb";
import { useModalAction } from "@/providers/modal-action";
import { useSyncEmulatorSaves } from "@/mutations/useSyncEmulatorSaves";
import { Emulator } from "@retrom/codegen/retrom/models/emulators_pb";
import { Spinner } from "@retrom/ui/components/spinner";
import { RawMessage } from "@/utils/protos";

type PlayGameButtonProps = { game: Game } & ComponentProps<typeof Button>;

export const PlayGameButton = forwardRef(
  (
    props: PlayGameButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { game } = props;
    const resolveSaveConflictModal = useModalAction("resolveCloudSaveConflict");
    const { mutateAsync: syncEmulatorSaves } = useSyncEmulatorSaves();
    const { data: emulatorData } = useDefaultEmulator(game);
    const { data: gameFiles } = useGameFiles({
      request: { gameIds: [game.id] },
      selectFn: (data) => data.gameFiles.filter((f) => f.gameId === game.id),
    });

    const { mutateAsync: maybeSyncEmulatorSaves } = useMutation({
      mutationFn: async (emulator: RawMessage<Emulator>) => {
        const emulatorId = emulator.id;
        const syncToast = toast({
          title: `Syncing Saves: ${emulator.name}`,
          duration: Infinity,
          dismissible: false,
          icon: <Spinner className="text-primary" />,
        });

        const response = await syncEmulatorSaves({
          emulatorId,
        });

        if (
          response.status === SaveSyncStatus.LOCAL_ERROR &&
          response.conflictReport
        ) {
          return await new Promise((resolve, reject) => {
            resolveSaveConflictModal.openModal({
              status: response,
              onClose: () => {
                reject(new Error("Save conflict not resolved"));
              },
              onResolved: (choice) =>
                match(choice)
                  .with("local", () =>
                    syncEmulatorSaves({
                      emulatorId,
                      behavior: SyncBehavior.FORCE_LOCAL,
                    })
                      .then((res) => resolve(res))
                      .catch(reject),
                  )
                  .with("cloud", () =>
                    syncEmulatorSaves({
                      emulatorId,
                      behavior: SyncBehavior.FORCE_CLOUD,
                    })
                      .then((res) => resolve(res))
                      .catch(reject),
                  )
                  .with("skip", () => {
                    resolve(null);
                  })
                  .exhaustive(),
            });
          });
        }

        syncToast.update({
          title: `Saves synced: ${emulator.name}`,
          icon: undefined,
          dismissible: true,
          duration: 5000,
        });

        return response;
      },
    });

    const { mutate: playAction } = usePlayGame(game);
    const { mutate: stopAction } = useStopGame(game);
    const navigate = useNavigate();
    const fullscreenMatch = useMatch({
      from: "/_fullscreenLayout",
      shouldThrow: false,
    });

    const { data: playStatusUpdate, status: queryStatus } =
      usePlayStatusQuery(game);

    const { emulator, defaultProfile } = emulatorData ?? {};

    const file = useMemo(
      () => gameFiles?.find((file) => file.id === game.defaultFileId),
      [game.defaultFileId, gameFiles],
    );

    const disabled = queryStatus !== "success";
    const shouldAddEmulator = !emulator && !fullscreenMatch && !game.thirdParty;

    const { mutate: playGame } = useMutation({
      mutationFn: async (args: RawMessage<PlayGamePayload>) => {
        const { emulator } = args;

        if (checkIsDesktop() && emulator) {
          try {
            await maybeSyncEmulatorSaves(emulator);
          } catch (error) {
            const errorMsg =
              error instanceof Error
                ? error.message
                : "An unknown error occurred.";

            toast({
              title: "Unable to Launch Game",
              description: errorMsg,
            });

            return;
          }
        }

        toast({
          title: game.thirdParty ? "Launching External Game" : "Launching Game",
          description: "Launching the game, this may take a few seconds.",
          duration: 3000,
        });

        playAction(args);
      },
    });

    const onClick = useCallback(() => {
      if (disabled) return;

      if (playStatusUpdate?.playStatus === PlayStatus.PLAYING) {
        stopAction({ game });
        return;
      }

      if (shouldAddEmulator) {
        return navigate({
          to: ".",
          search: { manageEmulatorsModal: { open: true } },
        });
      }

      playGame({
        game,
        emulatorProfile: defaultProfile,
        emulator,
        file,
      });
    }, [
      navigate,
      disabled,
      defaultProfile,
      emulator,
      file,
      game,
      playGame,
      playStatusUpdate,
      stopAction,
      shouldAddEmulator,
    ]);

    const Content = () => {
      if (queryStatus === "pending") {
        return (
          <>
            <LoaderCircleIcon className="h-[1.2rem] w-[1.2rem]" />
            Launching...
          </>
        );
      }

      if (playStatusUpdate?.playStatus === PlayStatus.PLAYING) {
        return (
          <>
            <Square className="h-[1.2rem] w-[1.2rem] fill-current" />
            Stop
          </>
        );
      }

      if (shouldAddEmulator) {
        return (
          <>
            <PlusIcon className="h-[1.2rem] w-[1.2rem] stroke-[3] stroke-current fill-current" />
            Add Emulator
          </>
        );
      }

      const text = game.thirdParty ? "Launch In Steam" : "Play";

      return (
        <div className="flex gap-2 items-center">
          <PlayIcon className="fill-current" />
          <p>{text}</p>
        </div>
      );
    };

    return (
      <Button
        ref={forwardedRef}
        {...props}
        disabled={disabled}
        onClick={onClick}
      >
        <Content />
      </Button>
    );
  },
);

PlayGameButton.displayName = "PlayGameButton";
