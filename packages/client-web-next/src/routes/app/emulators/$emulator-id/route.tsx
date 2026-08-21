import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/emulators/$emulator-id")({
  component: RouteComponent,
});

function RouteComponent() {
  const emulatorId = Route.useParams()["emulator-id"];

  return <div>Hello /app/emulators/${emulatorId}!</div>;
}
