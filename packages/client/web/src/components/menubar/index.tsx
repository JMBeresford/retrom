import { cn } from "@/lib/utils";
import { Menubar as MenubarImpl } from "@/components/ui/menubar";
import { LibraryMenu } from "./library-menu";
import { PlatformsMenu } from "./platforms-menu";
import { EmulatorsMenu } from "./emulators-menu";
import { FileMenu } from "./file-menu";
import { JobsIndicator } from "./jobs-indicator";
import { DesktopOnly } from "@/lib/env";
import { Link } from "@tanstack/react-router";

export function Menubar() {
  return (
    <header
      className={cn("px-3 sticky top-0 z-40 bg-background border-b flex ")}
    >
      <MenubarImpl className="border-0 items-stretch">
        <Link
          to="/"
          className="font-black grid place-items-center text-xl h-0 mr-4"
        >
          Retrom
        </Link>

        <DesktopOnly>
          <FileMenu />
        </DesktopOnly>

        <LibraryMenu />
        <PlatformsMenu />

        <DesktopOnly>
          <EmulatorsMenu />
        </DesktopOnly>
      </MenubarImpl>

      <div className="ml-auto h-full grid place-items-center">
        <JobsIndicator className="" />
      </div>
    </header>
  );
}
