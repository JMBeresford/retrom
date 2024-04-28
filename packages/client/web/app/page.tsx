import { Platforms } from "./platforms";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-8xl font-black mb-12">Retrom</h1>

      <Platforms />
    </main>
  );
}
