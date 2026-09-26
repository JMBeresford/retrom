import { cn } from "@retrom/ui-next/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@retrom/ui-next/components/carousel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@retrom/ui-next/components/tabs";
import { useCallback, useLayoutEffect, useState } from "react";
import { GameDetailCard } from "./game-detail-card";
import type { HTMLAttributes } from "react";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";

export type MediaProps = {
  metadata: GameMetadata;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function Media({ metadata, className, ...props }: MediaProps) {
  if (
    metadata.artworks.length === 0 &&
    metadata.screenshots.length === 0 &&
    metadata.videos.length === 0
  ) {
    return;
  }

  const defaultValue =
    metadata.artworks.length > 0
      ? "artworks"
      : metadata.screenshots.length > 0
        ? "screenshots"
        : "videos";

  return (
    <GameDetailCard className={cn(className)} {...props}>
      <Tabs defaultValue={defaultValue}>
        <TabsList
          className={cn("w-full flex items-stretch gap-2", "bg-transparent")}
        >
          <TabsTrigger hidden={metadata.artworks.length === 0} value="artworks">
            Artworks
          </TabsTrigger>
          <TabsTrigger
            hidden={metadata.screenshots.length === 0}
            value="screenshots"
          >
            Screenshots
          </TabsTrigger>
          <TabsTrigger hidden={metadata.videos.length === 0} value="videos">
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artworks">
          <ImageCarousel images={metadata.artworks} />
        </TabsContent>

        <TabsContent value="screenshots">
          <ImageCarousel images={metadata.screenshots} />
        </TabsContent>

        <TabsContent value="videos">
          <VideoCarousel videos={metadata.videos} />
        </TabsContent>
      </Tabs>
    </GameDetailCard>
  );
}

function ImageCarousel({ images }: { images: Array<string> }) {
  if (images.length === 0) {
    return;
  }

  return (
    <Carousel>
      <CarouselContent className="aspect-video">
        {images.map((image, idx) => (
          <CarouselItem key={idx}>
            <div
              className={cn(
                "relative grid place-items-center w-full h-max",
                "rounded overflow-hidden aspect-video",
              )}
            >
              <img
                src={image}
                className={cn(
                  "absolute inset-0 blur-3xl z-[-1] object-center",
                  "min-h-full min-w-full",
                )}
              />
              <img src={image} className="object-cover w-full" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious variant="secondary" />
      <CarouselNext variant="secondary" />
    </Carousel>
  );
}
function VideoCarousel({ videos }: { videos: Array<string> }) {
  return (
    <Carousel>
      <VideoCarouselContent videos={videos} />

      <CarouselPrevious variant="secondary" />
      <CarouselNext variant="secondary" />
    </Carousel>
  );
}

function VideoCarouselContent(props: { videos: Array<string> }) {
  const { videos } = props;
  const [inactive, setInactive] = useState(Array<number>());
  const { api } = useCarousel();

  const handleViewEvent = useCallback((currentApi: typeof api) => {
    const notInView = currentApi?.slidesNotInView();
    if (notInView) {
      setInactive(notInView);
    }
  }, []);

  useLayoutEffect(() => {
    api?.on("slidesInView", handleViewEvent);

    return () => {
      api?.off("slidesInView", handleViewEvent);
    };
  }, [api, handleViewEvent]);

  return (
    <CarouselContent className="h-max">
      {videos.map((video, idx) => (
        <CarouselItem key={idx}>
          {inactive.includes(idx) ? null : (
            <iframe
              // @ts-expect-error -- types out of date
              // eslint-disable-next-line react/no-unknown-property
              credentialless="true"
              className="w-full aspect-video rounded"
              src={video}
            />
          )}
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}
