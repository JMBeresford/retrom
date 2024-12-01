import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ExternalLinkIcon } from "lucide-react";
import { useGameDetail } from "@/providers/game-details";
import { useMemo } from "react";

export function Links() {
  const { gameMetadata } = useGameDetail();

  const links = useMemo(
    () =>
      gameMetadata?.links?.flatMap((link) => {
        try {
          const hostname = new URL(link).hostname
            .split(".")
            .filter((part) => part !== "www")
            .slice(0, -1)
            .join(".");

          return [{ hostname, link }];
        } catch {
          return [];
        }
      }) ?? [],
    [gameMetadata?.links],
  );

  if (!gameMetadata?.links?.length) {
    return null;
  }

  return (
    <Card className={`col-span-4 row-span-2`}>
      <CardHeader>
        <CardTitle>External Links</CardTitle>
      </CardHeader>
      <CardContent className="max-w-full">
        <ScrollArea
          type="auto"
          className={cn(
            "w-full whitespace-nowrap",
            "after:absolute after:inset-y-0 after:right-0 after:w-8",
            "after:bg-gradient-to-l after:from-background after:to-transparent z-10",
          )}
        >
          <div className="flex gap-3 w-max pb-4 pr-8">
            {links.map(({ link, hostname }, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                className={cn(
                  "underline text-muted-foreground hover:text-card-foreground transition-colors flex items-baseline gap-1",
                )}
              >
                {hostname}
                <ExternalLinkIcon className="h-[0.8rem] w-[0.8rem]" />
              </a>
            ))}
          </div>

          <ScrollBar orientation="horizontal" className="z-20" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
