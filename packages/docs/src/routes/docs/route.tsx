import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
