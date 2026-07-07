import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@retrom/ui-next/components/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@retrom/ui-next/components/item";
import { cn } from "@retrom/ui-next/lib/utils";
import { Download } from "lucide-react";
import { CollapsibleSidebarItem } from "@/sidebar/collapsible-sidebar-item";

const title = "Furi";
const bytesDownloaded = 423456789;
const totalBytes = 987654321;
const progress = (bytesDownloaded / totalBytes) * 100;
const iconUrl =
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c78bc3fc-9f08-47ca-81ae-d89055c7ec49/da8x0ph-6698d8db-34cd-4f12-b90a-88a14a673076.png/v1/fill/w_512,h_512/furi_icon_v1_by_andonovmarko_da8x0ph-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTEyIiwicGF0aCI6Ii9mL2M3OGJjM2ZjLTlmMDgtNDdjYS04MWFlLWQ4OTA1NWM3ZWM0OS9kYTh4MHBoLTY2OThkOGRiLTM0Y2QtNGYxMi1iOTBhLTg4YTE0YTY3MzA3Ni5wbmciLCJ3aWR0aCI6Ijw9NTEyIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.8iM1ycL3YrCHgz1fUOH7lB7jV3o0aQRnx_5ouLvMBn0";
const bgUrl = "https://images6.alphacoders.com/115/1150401.jpg";

export function InstallationTracker() {
  return (
    <div className="relative w-full h-full">
      <CollapsibleSidebarItem
        collapsed={
          <Avatar className="relative overflow-hidden ring-1 ring-inset">
            <AvatarImage src={iconUrl} />
            <AvatarFallback>F</AvatarFallback>

            <div className="absolute inset-0 bg-background/70 grid place-items-center">
              <Download className="animate-pulse" />
            </div>
          </Avatar>
        }
        expanded={
          <Item
            className={cn("h-18 w-full relative overflow-hidden")}
            variant="outline"
          >
            <img
              src={bgUrl}
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-background/80" />

            <ItemMedia variant="image" className="z-10">
              <Avatar>
                <AvatarImage src={iconUrl} />
                <AvatarFallback>F</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="z-10 text-foreground">
              <ItemTitle className="font-bold">Installing: {title}</ItemTitle>
              <ItemDescription className="font-medium not-dark:text-foreground">
                Progress: {progress.toFixed(2)}%
              </ItemDescription>
            </ItemContent>
          </Item>
        }
      />
    </div>
  );
}
