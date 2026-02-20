import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@retrom/ui/components/card";
import { cn } from "@retrom/ui/lib/utils";
import { ScrollArea, ScrollBar } from "@retrom/ui/components/scroll-area";
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

  if (!links?.length) {
    return null;
  }

  return (
    <Card>
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
          <div className="flex flex-wrap justify-center sm:flex-nowrap gap-3 sm:w-max pb-4 sm:pr-8">
            {links.map(({ link, hostname }, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                className={cn(
                  "underline text-muted-foreground hover:text-card-foreground transition-colors flex items-baseline gap-1",
                )}
                rel="noreferrer"
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
