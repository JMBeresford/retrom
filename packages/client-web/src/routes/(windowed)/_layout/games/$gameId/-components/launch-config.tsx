import { Card, CardContent } from "@retrom/ui/components/card";
import { useGameDetail } from "@/providers/game-details";
import { InfoItem } from "./general-info";
import { Separator } from "@retrom/ui/components/separator";
import { Button } from "@retrom/ui/components/button";
import { Link } from "@tanstack/react-router";

export function LaunchConfig() {
  const { emulator, defaultProfile } = useGameDetail();

  return (
    <Card className="py-0">
      <CardContent className="py-4">
        <InfoItem
          title="Emulator"
          value={
            emulator?.name ?? (
              <span className="italic">No valid emulator found...</span>
            )
          }
        />

        <InfoItem
          title="Profile"
          value={
            defaultProfile?.name ?? (
              <span className="italic">No profile selected...</span>
            )
          }
        />

        <Separator className="my-4" />

        <Button variant="outline" className="w-full gap-2" asChild>
          <Link
            to="."
            search={(prev) => ({
              ...prev,
              defaultProfilesModal: { open: true },
            })}
          >
            Manage Defaults
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
