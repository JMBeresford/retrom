import { ScrollArea } from "@/components/ui/scroll-area";
import { useRehypeRemark } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import Markdown from "react-markdown";

export function Description() {
  const { gameMetadata } = useGameDetail();
  const description = useRehypeRemark(gameMetadata?.description);

  return (
    <ScrollArea className="flex flex-col max-h-[250px] my-2">
      <Markdown className={cn("text-foreground/90")}>
        {description || "No description available."}
      </Markdown>
    </ScrollArea>
  );
}
