import { useGroupContext } from "@/providers/fullscreen/group-context";
import { GridGameList } from "@/components/fullscreen/grid-game-list";
import { CatchBoundary, createLazyFileRoute } from "@tanstack/react-router";
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
          <CatchBoundary
            getResetKey={() => "resetScene"}
            onCatch={(error, info) => {
              console.warn("Caught error at boundary: ", error, info);
            }}
            errorComponent={() => (
              <div className="w-full h-full bg-gradient-to-t to-secondary/30 from-accent/10"></div>
            )}
          >
            <Scene>
              <Background />
            </Scene>
          </CatchBoundary>
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
