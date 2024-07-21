import { cn } from "@/lib/utils";
import { Menubar as MenubarImpl } from "@/components/ui/menubar";
import { FileMenu } from "./file-menu";
import { LibraryMenu } from "./library-menu";
import { PlatformsMenu } from "./platforms-menu";
import { Suspense } from "react";
import { EmulatorsMenu } from "./emulators-menu";

export function Menubar() {
  return (
    <header
      className={cn(
        "px-3 flex items-center gap-4 sticky top-0 z-40 bg-background",
      )}
    >
      <MenubarImpl className="border-0">
        <FileMenu />
        <LibraryMenu />
        <Suspense fallback={null}>
          <PlatformsMenu />
        </Suspense>

        <EmulatorsMenu />
      </MenubarImpl>
    </header>
  );
}
