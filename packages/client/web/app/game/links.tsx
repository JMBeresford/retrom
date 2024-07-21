import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameDetail } from "./game-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function Links() {
  const { gameMetadata } = useGameDetail();

  if (!gameMetadata?.links?.length) {
    return null;
  }

  return (
    <Card className={`col-span-3`}>
      <CardHeader>
        <CardTitle>Links</CardTitle>
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
            {gameMetadata?.links.map((link, idx) => (
              <Link
                key={idx}
                href={link}
                className={cn(
                  "underline text-muted-foreground hover:text-card-foreground transition-colors",
                )}
              >
                {new URL(link).hostname.split(".").at(-2)}
              </Link>
            ))}
          </div>

          <ScrollBar orientation="horizontal" className="z-20" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
