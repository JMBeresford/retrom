import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/config/interface")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /app/config/interface!</div>;
}
