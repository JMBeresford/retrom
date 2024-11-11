import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { ActionButton } from "../../../../../../components/action-button";
import { useGameDetail } from "@/providers/game-details";
import { Link } from "@tanstack/react-router";

export function Actions() {
  const { game } = useGameDetail();
  const { data: installationState } = useInstallationQuery(game);

  return (
    <div className="flex">
      <div
        className={cn(
          "w-full *:w-full rounded-bl-lg overflow-hidden border-r-2",
          installationState === InstallationStatus.INSTALLING && "bg-primary",
        )}
      >
        <ActionButton
          game={game}
          className='[&_div[role="progressbar"]]:w-[85%] [&_div[role="progressbar"]_>_*]:bg-primary-foreground'
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="accent"
            className="rounded-none rounded-br-lg overflow-hidden ring-inset"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link search={{ updateMetadataModal: { open: true } }}>Edit</Link>
          </DropdownMenuItem>

          {installationState === InstallationStatus.INSTALLED && (
            <DropdownMenuItem asChild>
              <Link search={{ uninstallGameModal: { open: true } }}>
                Uninstall
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link
              className="text-destructive-text"
              search={{ deleteGameModal: { open: true } }}
            >
              Delete
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
