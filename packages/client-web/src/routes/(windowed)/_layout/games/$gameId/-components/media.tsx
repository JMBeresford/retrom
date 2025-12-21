import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@retrom/ui/components/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@retrom/ui/components/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@retrom/ui/components/carousel";
import { Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import { createUrl, usePublicUrl } from "@/utils/urls";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";

export function Media() {
  const publicUrl = usePublicUrl();
  const { gameMetadata, extraMetadata } = useGameDetail();

  const screenshots = useMemo(() => {
    const localPaths = extraMetadata?.mediaPaths?.screenshotUrls;
    if (localPaths && publicUrl) {
      return localPaths
        .map((path) => createUrl({ path, base: publicUrl })?.href)
        .filter((s) => s !== undefined);
    }

    return gameMetadata?.screenshotUrls ?? [];
  }, [publicUrl, extraMetadata, gameMetadata]);

  const artwork = useMemo(() => {
    const localPaths = extraMetadata?.mediaPaths?.artworkUrls;
    if (localPaths && publicUrl) {
      return localPaths
        .map((path) => createUrl({ path, base: publicUrl })?.href)
        .filter((s) => s !== undefined);
    }

    return gameMetadata?.artworkUrls ?? [];
  }, [publicUrl, extraMetadata, gameMetadata]);

  if (!gameMetadata) {
    return null;
  }

  const showImages = !!artwork.length;
  const showScreenshots = !!screenshots.length;
  const showVideos = !!gameMetadata?.videoUrls.length;

  let tabsShown = 0;
  if (showImages) tabsShown++;
  if (showScreenshots) tabsShown++;
  if (showVideos) tabsShown++;

  if (tabsShown === 0) {
    return null;
  }

  const defaultTab = showImages
    ? "images"
    : showScreenshots
      ? "screenshots"
      : showVideos
        ? "videos"
        : "none";

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={defaultTab}>
          {tabsShown > 1 ? (
            <TabsList className="flex w-full *:w-full">
              {showImages ? (
                <TabsTrigger value="images">Images</TabsTrigger>
              ) : null}
              {showScreenshots ? (
                <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
              ) : null}
              {showVideos ? (
                <TabsTrigger value="videos">Videos</TabsTrigger>
              ) : null}
            </TabsList>
          ) : null}

          <TabsContent value="images">
            <ImageCarousel images={artwork} />
          </TabsContent>

          <TabsContent value="screenshots">
            <ImageCarousel images={screenshots} />
          </TabsContent>

          <TabsContent value="videos">
            <VideoCarousel videos={gameMetadata.videoUrls} />
          </TabsContent>

          <TabsContent value="none">
            <div className="w-full aspect-video grid place-items-center">
              <h4 className="text-muted-foreground/50 font-medium text-3xl">
                No media available.
              </h4>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ImageCarousel(props: { images: string[] }) {
  const { images } = props;

  return (
    <Carousel className="group">
      <CarouselContent className="h-max">
        {images.map((img, idx) => (
          <CarouselItem key={idx}>
            <div
              className={cn(
                "relative h-full aspect-video rounded-lg overflow-hidden",
                "flex justify-center items-center",
              )}
            >
              <Image
                src={img}
                className="absolute inset-0 blur-3xl z-[-1]"
                alt=""
              />
              <Image src={img} className="max-h-full mx-auto" alt="" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {images.length > 1 ? <Controls /> : null}
    </Carousel>
  );
}

function VideoCarousel(props: { videos: string[] }) {
  const { videos } = props;

  return (
    <Carousel className="group" opts={{ inViewThreshold: 0.2 }}>
      <VideoItems videos={videos} />

      {videos.length > 1 ? <Controls /> : null}
    </Carousel>
  );
}

function VideoItems(props: { videos: string[] }) {
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
              credentialless="true"
              className="w-full aspect-video rounded-lg"
              src={video}
            />
          )}
        </CarouselItem>
      ))}
    </CarouselContent>
  );
}

function Controls() {
  return (
    <div className="group-hover:opacity-100 opacity-0 transition-opacity">
      <CarouselPrevious variant="accent" className="ml-8" />
      <CarouselNext variant="accent" className="mr-8" />
    </div>
  );
}
