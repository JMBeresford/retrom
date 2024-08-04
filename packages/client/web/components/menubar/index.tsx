import { cn } from "@/lib/utils";
import { Menubar as MenubarImpl } from "@/components/ui/menubar";
import { LibraryMenu } from "./library-menu";
import { PlatformsMenu } from "./platforms-menu";
import { Suspense } from "react";
import { EmulatorsMenu } from "./emulators-menu";
import Link from "next/link";
import { FileMenu } from "./file-menu";

export function Menubar() {
  return (
    <header className={cn("px-3 sticky top-0 z-40 bg-background border-b")}>
      <MenubarImpl className="border-0 flex items-baseline">
        <Link
          href="/"
          className="font-black grid place-items-center text-xl h-0 mr-4"
        >
          Retrom
        </Link>

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
