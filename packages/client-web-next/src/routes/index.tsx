import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@retrom/ui-next/components/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main className="h-dvh grid place-items-center bg-background">
      <h1 className="text-3xl font-heading"> Oh hi mark</h1>

      <Button variant="destructive">Click Me</Button>
    </main>
  );
}
