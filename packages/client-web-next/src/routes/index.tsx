import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return <main className="h-dvh grid place-items-center">Oh hi mark</main>;
}
