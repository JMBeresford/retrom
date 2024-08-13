"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameDetail } from "../game-details-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ExternalLinkIcon } from "lucide-react";

export function Links() {
  const { gameMetadata } = useGameDetail();

  if (!gameMetadata?.links?.length) {
    return null;
  }

  return (
    <Card className={`col-span-3`}>
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
            {gameMetadata?.links.map((link, idx) => (
              <Link
                key={idx}
                href={link}
                className={cn(
                  "underline text-muted-foreground hover:text-card-foreground transition-colors flex items-baseline gap-1",
                )}
              >
                {new URL(link).hostname.split(".").at(-2)}
                <ExternalLinkIcon className="h-[0.8rem] w-[0.8rem]" />
              </Link>
            ))}
          </div>

          <ScrollBar orientation="horizontal" className="z-20" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
