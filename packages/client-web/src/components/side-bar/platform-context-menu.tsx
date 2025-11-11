import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@retrom/ui/components/dropdown-menu";
import { ComponentPropsWithoutRef } from "react";
import { PlatformWithMetadata } from "./metadata-context";
import { getFileStub } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import { Button } from "@retrom/ui/components/button";
import { EllipsisVertical } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function PlatformContextMenu(
  props: ComponentPropsWithoutRef<typeof DropdownMenuTrigger> & {
    platform: PlatformWithMetadata;
  },
) {
  const { platform, ...rest } = props;

  const name = platform.metadata?.name || getFileStub(platform.path);
  const { id, thirdParty } = platform;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        {...rest}
        className={cn(
          "sm:opacity-0 transition-opacity active:opacity-100",
          "sm:group-hover:opacity-100 data-[state=open]:opacity-100",
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="w-fit h-fit aspect-square p-2 my-auto"
        >
          <EllipsisVertical className={cn("w-[1rem] h-[1rem]")} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "w-dvw flex flex-col items-center gap-2",
          "sm:w-auto sm:block",
        )}
      >
        <DropdownMenuItem
          asChild
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link
            to="."
            search={(prev) => ({
              ...prev,
              updatePlatformMetadataModal: { open: true, id: platform.id },
            })}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="text-destructive-text"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link
            to="."
            search={(prev) => ({
              ...prev,
              deletePlatformModal: {
                open: true,
                platform: { id, name, thirdParty },
              },
            })}
          >
            Delete
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
