import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/downloads")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /app/downloads!</div>;
}
