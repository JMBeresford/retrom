import { useInstallationProgressContext } from "@/providers/installation-progress";
import { InstallationProgressUpdate } from "@retrom/codegen/retrom/client/installation_pb";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/(windowed)/_layout/installing")({
  component: RouteComponent,
});

function RouteComponent() {
  const installations = useInstallationProgressContext((s) => s);

  return (
    <main>
      <h3 className="text-3xl font-bold">Game Installations</h3>

      {Object.entries(installations).map(([gameId, updates]) => (
        <InstallationItem
          key={gameId}
          gameId={Number(gameId)}
          updates={updates}
        />
      ))}
    </main>
  );
}

function InstallationItem({
  gameId,
  updates,
}: {
  gameId: number;
  updates: InstallationProgressUpdate[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg">Game {gameId}</p>

      <p>Progress: {updates.at(-1)?.percent}</p>
    </div>
  );
}
