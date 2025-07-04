import { createLazyFileRoute } from "@tanstack/react-router";
import { RecentlyAdded } from "@/components/recently-added";
import { RecentlyPlayed } from "@/components/recently-played";

export const Route = createLazyFileRoute("/(windowed)/_layout/home")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <section className="flex flex-col gap-5">
      <RecentlyAdded />
      <RecentlyPlayed />
    </section>
  );
}
