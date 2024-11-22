import { useGroupContext } from "@/providers/fullscreen/group-context";
import { GridGameList } from "@/components/fullscreen/grid-game-list";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { GroupMenu } from "@/components/fullscreen/group-menu";
import { ActionBar } from "@/components/fullscreen/action-bar";
import { Fragment } from "react/jsx-runtime";
import { Background, Scene } from "@/components/fullscreen/scene";

export const Route = createLazyFileRoute("/_fullscreenLayout/fullscreen/")({
  component: FullscreenComponent,
});

function FullscreenComponent() {
  const { activeGroup, allGroups } = useGroupContext();

  return (
    <div className="max-h-full h-fit flex flex-col overflow-hidden flex-grow">
      <ScrollArea className="h-full relative">
        <div className="absolute inset-0 z-[-1]">
          <Scene>
            <Background />
          </Scene>
        </div>

        <div className="relative">
          {allGroups.map((group) =>
            activeGroup?.id === group.id ? (
              <GridGameList key={group.id} games={group.games} />
            ) : (
              <Fragment key={group.id} />
            ),
          )}
        </div>

        <Scrollbar orientation="vertical" className="z-[100]" />
      </ScrollArea>

      <ActionBar className="fixed bottom-0 inset-x-0 overflow-hidden max-w-screen">
        <GroupMenu className="w-full" />
      </ActionBar>
    </div>
  );
}
