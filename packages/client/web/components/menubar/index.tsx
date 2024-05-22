import { cn } from "@/lib/utils";
import { Menubar as MenubarImpl } from "@/components/ui/menubar";
import { FileMenu } from "./file-menu";
import { LibraryMenu } from "./library-menu";
import { MetadataMenu } from "./metadata-menu";
import { Suspense } from "react";

export function Menubar() {
  return (
    <header
      className={cn(
        "border-b px-3 flex items-center gap-4 sticky top-0 z-40 bg-background",
      )}
    >
      <MenubarImpl className="border-0">
        <FileMenu />
        <LibraryMenu />
        <Suspense fallback={null}>
          <MetadataMenu />
        </Suspense>
      </MenubarImpl>
    </header>
  );
}
