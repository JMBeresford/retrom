import { RecentlyAdded } from "./recently-added";
import { RecentlyPlayed } from "./recently-played";

export default async function Home() {
  return (
    <section className="flex flex-col gap-5">
      <RecentlyAdded />
      <RecentlyPlayed />
    </section>
  );
}
