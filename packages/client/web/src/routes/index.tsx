import { RecentlyAdded } from "@/components/recently-added";
import { RecentlyPlayed } from "@/components/recently-played";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <section className="flex flex-col gap-5">
      <RecentlyAdded />
      <RecentlyPlayed />
    </section>
  );
}
