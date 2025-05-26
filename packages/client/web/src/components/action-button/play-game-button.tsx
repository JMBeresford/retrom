import { Button } from "@/components/ui/button";
import { usePlayGame } from "@/mutations/usePlayGame";
import { usePlayStatusQuery } from "@/queries/usePlayStatus";
import { PlayStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
import { useStopGame } from "@/mutations/useStopGame";
import { ComponentProps, ForwardedRef, forwardRef, useCallback } from "react";
import { LoaderCircleIcon, PlayIcon, PlusIcon, Square } from "lucide-react";
import { useGameDetail } from "@/providers/game-details";
import { useMatch, useNavigate } from "@tanstack/react-router";
import { useToast } from "../ui/use-toast";

export const PlayGameButton = forwardRef(
  (
    props: ComponentProps<typeof Button>,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) => {
    const { toast } = useToast();
    const { game, gameFiles, emulator, defaultProfile } = useGameDetail();

    const { mutate: playAction } = usePlayGame(game);
    const { mutate: stopAction } = useStopGame(game);
    const navigate = useNavigate();
    const fullscreenMatch = useMatch({
      from: "/_fullscreenLayout",
      shouldThrow: false,
    });

    const { data: playStatusUpdate, status: queryStatus } =
      usePlayStatusQuery(game);

    const file = gameFiles?.find((file) => file.id === game.defaultFileId);
    const disabled = queryStatus !== "success";
    const shouldAddEmulator = !emulator && !fullscreenMatch && !game.thirdParty;

    const onClick = useCallback(() => {
      if (disabled) return;

      if (playStatusUpdate?.playStatus === PlayStatus.PLAYING) {
        stopAction({ game });
        return;
      }

      if (shouldAddEmulator) {
        return navigate({ search: { manageEmulatorsModal: { open: true } } });
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
        <>
          <PlayIcon className="h-[1.2rem] w-[1.2rem] fill-current" />
          {text}
        </>
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
