import { createFileRoute } from "@tanstack/react-router";
import { BackgroundImage } from "./-components/background-image";
import { CoverImage } from "./-components/cover-image";
import { Actions } from "./-components/actions";
import { GeneralInfo } from "./-components/general-info";
import { Genres } from "./-components/genres";
import { cn } from "@/lib/utils";
import { Title } from "./-components/title";
import { Description } from "./-components/description";
import { Links } from "./-components/links";
import { GameFiles } from "./-components/game-files";
import { Media } from "./-components/media";
import { SimilarGames } from "./-components/similar_games";
import { GameDetailProvider } from "@/providers/game-details";
import { UpdateMetadataModal } from "@/components/modals/update-metadata";
import { DeleteGameModal } from "@/components/modals/delete-game";
import { UninstallGameModal } from "@/components/modals/uninstall-game";
import { z } from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";

const modalsSchema = z.object({
  updateMetadataModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  uninstallGameModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  deleteGameModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
});

export const Route = createFileRoute("/(windowed)/_layout/games/$gameId/")({
  validateSearch: zodSearchValidator(modalsSchema),
  component: Game,
});

function Game() {
  const { gameId } = Route.useParams();

  return (
    <GameDetailProvider gameId={parseInt(gameId)}>
      <div className={cn("relative grid grid-cols-[300px_1fr] gap-8")}>
        <BackgroundImage />
        <div id="left" className="flex flex-col gap-5">
          <div className={cn("flex flex-col relative")}>
            <CoverImage />
            <Actions />
          </div>

          <GeneralInfo />
          <Genres />
        </div>

        <div id="right" className="pr-5 max-w-[1250px]">
          <div className="pb-5">
            <Title />
            <Description />
          </div>

          <div
            className={cn(
              `grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] grid-rows-[repeat(auto-fit,minmax(100px,1fr))]`,
              "grid-flow-dense gap-5",
            )}
          >
            <Links />
            <GameFiles />
            <Media />

            <SimilarGames />
          </div>
        </div>
      </div>

      <UpdateMetadataModal />
      <UninstallGameModal />
      <DeleteGameModal />
    </GameDetailProvider>
  );
}
