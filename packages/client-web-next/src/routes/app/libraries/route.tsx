import { createFileRoute } from "@tanstack/react-router";
import { useLibraries } from "@/data/libraries/use-libraries";

export const Route = createFileRoute("/app/libraries")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: libraries, isPending, error } = useLibraries();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ul>
      {libraries.map((library) => (
        <li key={library.id}>{library.name}</li>
      ))}

      {libraries.length === 0 && <li>No libraries found.</li>}
    </ul>
  );
}
