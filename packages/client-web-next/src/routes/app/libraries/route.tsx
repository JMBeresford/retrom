import { createFileRoute } from "@tanstack/react-router";
import { create } from "@bufbuild/protobuf";
import { LibrarySchema } from "@retrom/codegen/retrom/services/library/v1/models_pb";
import { LibraryTable } from "./-components/table";
import { useLibraries } from "@/data/libraries/use-libraries";

export const Route = createFileRoute("/app/libraries")({
  component: RouteComponent,
});

const libraries = [
  create(LibrarySchema, { id: "1", name: "foo" }),
  create(LibrarySchema, { id: "2", name: "bar" }),
];

function RouteComponent() {
  const { data: _libraries, isPending, error } = useLibraries();

  // if (isPending) {
  //   return <div>Loading...</div>;
  // }
  //
  // if (error) {
  //   return <div>Error: {error.message}</div>;
  // }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-3xl font-bold">Libraries</h1>

      <LibraryTable libraries={libraries} />
    </div>
  );
}
