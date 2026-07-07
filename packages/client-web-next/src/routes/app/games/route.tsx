import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/games")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/games"!</div>;
}
