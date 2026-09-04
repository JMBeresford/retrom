import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PathHeading } from "../-components/path-heading";
import { PlatformItem } from "./-components/platform-item";
import { browseHeadingSegments } from "./-components/browse-heading";
import { useListPlatforms } from "@/data/libraries/use-list-platforms";

export const Route = createFileRoute("/app/browse/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending, isError } = useListPlatforms({
    options: {
      select: (response) => response.platforms,
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <Loader2 size={80} className="animate-spin text-accent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <p className="text-destructive">Error loading platforms</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <PathHeading segments={browseHeadingSegments} />

        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
          {data.map((platform) => (
            <PlatformItem key={platform.id} platformId={platform.id} />
          ))}
        </div>
      </div>
    </>
  );
}
