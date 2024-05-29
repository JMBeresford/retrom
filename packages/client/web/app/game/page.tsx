import { GameDetails } from "./game-details";
import { GameDetailProvider } from "./game-context";

export default async function Page() {
  return (
    <GameDetailProvider>
      <GameDetails />
    </GameDetailProvider>
  );
}
