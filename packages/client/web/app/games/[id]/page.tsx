import { cn } from "@/lib/utils";
import { Actions } from "./_components/actions";
import { Genres } from "./_components/genres";
import { Media } from "./_components/media";
import { Links } from "./_components/links";
import { SimilarGames } from "./_components/similar_games";
import { GameFiles } from "./_components/game-files";
import { GeneralInfo } from "./_components/general-info";
import { BackgroundImage } from "./_components/background-image";
import { CoverImage } from "./_components/cover-image";
import { Title } from "./_components/title";
import { Description } from "./_components/description";

export default function GameDetails() {
  return (
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

      <div id="right" className="pr-5">
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
  );
}
