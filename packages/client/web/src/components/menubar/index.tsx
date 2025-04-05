import { cn } from "@/lib/utils";
import { Menubar as MenubarImpl } from "@/components/ui/menubar";
import { LibraryMenu } from "./library-menu";
import { PlatformsMenu } from "./platforms-menu";
import { EmulatorsMenu } from "./emulators-menu";
import { FileMenu } from "./file-menu";
import { JobsIndicator } from "./jobs-indicator";
import { Link } from "@tanstack/react-router";
import { ViewMenu } from "./view-menu";
import { ConnectivityIndicator } from "./connectivity-indicator";

export function Menubar() {
  return (
    <header
      className={cn("px-3 sticky top-0 z-40 bg-background border-b flex ")}
    >
      <MenubarImpl className="border-0 items-stretch">
        <Link
          to="/home"
          className="font-black grid place-items-center text-xl h-0 mr-4"
        >
          Retrom
        </Link>

        <FileMenu />

        <LibraryMenu />
        <PlatformsMenu />

        <EmulatorsMenu />

        <ViewMenu />
      </MenubarImpl>

      <div className="ml-auto h-full grid place-items-center grid-flow-col gap-2">
        <JobsIndicator className="" />
        <ConnectivityIndicator />
      </div>
    </header>
  );
}
