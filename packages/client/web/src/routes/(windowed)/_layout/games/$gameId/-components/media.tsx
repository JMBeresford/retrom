import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn, Image } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";

export function Media() {
  const { gameMetadata } = useGameDetail();

  if (!gameMetadata) {
    return null;
  }

  const showImages = gameMetadata?.artworkUrls.length;
  const showScreenshots = gameMetadata?.screenshotUrls.length;
  const showVideos = gameMetadata?.videoUrls.length;

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
    <Card className="col-span-6 row-span-4">
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={defaultTab}>
          {tabsShown > 1 ? (
            <TabsList>
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
            <ImageCarousel images={gameMetadata!.artworkUrls} />
          </TabsContent>

          <TabsContent value="screenshots">
            <ImageCarousel images={gameMetadata!.screenshotUrls} />
          </TabsContent>

          <TabsContent value="videos">
            <VideoCarousel videos={gameMetadata!.videoUrls} />
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
    <Carousel className="group">
      <CarouselContent className="h-max">
        {videos.map((video, idx) => (
          <CarouselItem key={idx}>
            <iframe className="w-full aspect-video rounded-lg" src={video} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {videos.length > 1 ? <Controls /> : null}
    </Carousel>
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
