import { GameDetails } from "./game-details";
import { redirect } from "next/navigation";
import { GameDetailProvider } from "./game-context";
import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";

type Props = {
  params: {
    platformId: string;
    id: string;
  };
};

export default async function Page(props: Props) {
  const { params } = props;

  const id = parseInt(params.id, 10);
  const platformId = parseInt(params.platformId, 10);

  if (isNaN(id)) {
    return redirect("/404");
  }

  if (isNaN(platformId)) {
    return redirect("/404");
  }

  return (
    <GameDetailProvider id={id} platformId={platformId}>
      <GameDetails />
    </GameDetailProvider>
  );
}
