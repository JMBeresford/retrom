import { createFileRoute } from "@tanstack/react-router";
import content from "./content.md?raw";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/docs/nix")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Markdown>{content}</Markdown>;
}
