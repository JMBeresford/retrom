import { createLazyFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/_fullscreenLayout/fullscreen/games/",
)({
  component: () => <Navigate to="/fullscreen" />,
});
