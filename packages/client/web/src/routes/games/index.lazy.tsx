import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/games/")({
  component: () => <div>Hello /games/!</div>,
});

