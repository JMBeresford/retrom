import { useGroupContext } from "@/providers/fullscreen/group-context";
import { GridGameList } from "@/components/fullscreen/grid-game-list";
import { CatchBoundary, createLazyFileRoute } from "@tanstack/react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { GroupMenu } from "@/components/fullscreen/group-menu";
import { ActionBar } from "@/components/fullscreen/action-bar";
import { Fragment } from "react/jsx-runtime";
import { Background, Scene } from "@/components/fullscreen/scene";
import {
  FocusContainer,
  useFocusable,
} from "@/components/fullscreen/focus-container";
import { cn, getFileStub } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HotkeyLayer } from "@/providers/hotkeys/layers";

export const Route = createLazyFileRoute("/_fullscreenLayout/fullscreen/")({
  component: FullscreenComponent,
});

function FullscreenComponent() {
  const { activeGroup, allGroups } = useGroupContext();

  return (
    <div className="h-full grid grid-flow-row grid-rows-[1fr_auto]">
      <div className="relative flex w-full overflow-hidden">
        <CharList />
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
        <ScrollArea className="max-h-full w-full">
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
      </div>

      <ActionBar className="w-full overflow-hidden max-w-screen">
        <GroupMenu className="w-full" />
      </ActionBar>
    </div>
  );
}

const chars = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

function CharList() {
  const { activeGroup } = useGroupContext();

  return (
    <ScrollArea
      className={cn(
        "max-h-full opacity-100 transition-opacity pointer-events-auto touch-auto",
        !activeGroup?.alphabeticallySorted &&
          "opacity-0 pointer-events-none touch-none",
      )}
    >
      <FocusContainer
        opts={{
          focusKey: "char-list",
          focusable: !!activeGroup?.alphabeticallySorted,
        }}
        className="flex flex-col gap-2 py-10 px-2"
      >
        {chars.map((char) => (
          <CharItem key={char} char={char} />
        ))}
      </FocusContainer>

      <Scrollbar orientation="vertical" className="opacity-0" />
    </ScrollArea>
  );
}

function CharItem(props: { char: string }) {
  const { char } = props;
  const { activeGroup } = useGroupContext();

  const scrollToId = activeGroup?.games?.find((game) => {
    const name = game.metadata?.name ?? getFileStub(game.path);

    return name ? name[0].toLowerCase() === char.toLowerCase() : false;
  })?.id;

  const { ref } = useFocusable<HTMLButtonElement>({
    focusKey: `char-list-${char}`,
    focusable: scrollToId !== undefined,

    onFocus: ({ node }) => {
      node.focus();
      node.scrollIntoView({ block: "center" });
    },
  });

  return (
    <HotkeyLayer
      handlers={{
        ACCEPT: {
          handler: () => ref.current?.click(),
        },
      }}
    >
      <Button
        ref={ref}
        variant="inline"
        size="icon"
        disabled={scrollToId === undefined}
        onClick={() => {
          document
            .getElementById(`game-list-${scrollToId}`)
            ?.scrollIntoView({ block: "center" });
        }}
        className={cn(
          "w-fit h-fit aspect-square flex items-center justify-center",
          "text-foreground font-bold opacity-30",
          "transition-all ease-in-out duration-200 p-3",
          "focus-hover:opacity-100 focus-hover:bg-foreground/10",
          "disabled:opacity-15",
        )}
      >
        {char}
      </Button>
    </HotkeyLayer>
  );
}
