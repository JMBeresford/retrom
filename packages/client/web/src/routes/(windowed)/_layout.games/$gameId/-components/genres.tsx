import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameDetail } from "@/providers/game-details";

export function Genres() {
  const { extraMetadata } = useGameDetail();

  if (!extraMetadata?.genres?.value) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Genres</CardTitle>
      </CardHeader>
      <CardContent className="w-full flex flex-col gap-2">
        {extraMetadata?.genres?.value.map((genre) => (
          <Badge key={genre.id} variant="outline" className="mr-2 w-fit">
            {genre.name}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
