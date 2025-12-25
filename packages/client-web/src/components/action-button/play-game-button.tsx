import { Button } from "@retrom/ui/components/button";
import { usePlayGame } from "@/mutations/usePlayGame";
import { usePlayStatusQuery } from "@/queries/usePlayStatus";
import { PlayStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
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
import { useToast } from "@retrom/ui/hooks/use-toast";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { useDefaultEmulator } from "@/queries/useDefaultEmulator";
import { useGameFiles } from "@/queries/useGameFiles";

type PlayGameButtonProps = { game: Game } & ComponentProps<typeof Button>;

export const PlayGameButton = forwardRef(
  (
    props: PlayGameButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { game } = props;
    const { toast } = useToast();
    const { data: emulatorData } = useDefaultEmulator(game);
    const { data: gameFiles } = useGameFiles({
      request: { gameIds: [game.id] },
      selectFn: (data) => data.gameFiles.filter((f) => f.gameId === game.id),
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

      toast({
        title: game.thirdParty ? "Launching External Game" : "Launching Game",
        description: "Launching the game, this may take a few seconds.",
        duration: 3000,
      });

      playAction({
        game,
        emulatorProfile: defaultProfile,
        emulator: emulator,
        file,
      });
    }, [
      toast,
      navigate,
      disabled,
      defaultProfile,
      emulator,
      file,
      game,
      playAction,
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
