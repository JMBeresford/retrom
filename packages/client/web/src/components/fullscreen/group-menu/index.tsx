import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Link,
  useElementScrollRestoration,
  useNavigate,
} from "@tanstack/react-router";
import { Group, useGroupContext } from "@/providers/fullscreen/group-context";
import { useEffect, useMemo, useRef } from "react";
import { HotkeyButton } from "../hotkey-button";
import { HotkeyHandlers, useHotkeys } from "@/providers/hotkeys";
import { ArrowLeft, ArrowRight } from "lucide-react";

declare global {
  export interface HotkeyZones {
    groupMenu: boolean;
  }
}

const scrollRestorationId = "groupMenu";

export function GroupMenu(
  props: Omit<JSX.IntrinsicElements["div"], "children">,
) {
  const { previousGroup, nextGroup, allGroups } = useGroupContext();
  const navigate = useNavigate();
  useElementScrollRestoration({ id: scrollRestorationId });

  const handlers = useMemo(
    () =>
      ({
        PAGE_LEFT: {
          handler: () =>
            navigate({
              search: (prev) => ({ ...prev, activeGroupId: previousGroup?.id }),
            }),
          zone: "groupMenu",
        },
        PAGE_RIGHT: {
          handler: () =>
            navigate({
              search: (prev) => ({ ...prev, activeGroupId: nextGroup?.id }),
            }),
          zone: "groupMenu",
        },
      }) satisfies HotkeyHandlers,
    [navigate, previousGroup, nextGroup],
  );

  useHotkeys({ handlers });

  return (
    <div {...props}>
      <div className={cn("animate-in fade-in w-full")}>
        <div
          className={cn(
            "w-full relative",
            "flex items-center",
            "pointer-events-auto touch-auto",
          )}
        >
          <div className="pr-2 w-full border-r justify-self-start flex basis-1">
            <HotkeyButton
              hotkey="PAGE_LEFT"
              disabled={previousGroup?.id === undefined}
              onClick={() => void handlers.PAGE_LEFT.handler()}
            >
              <ArrowLeft className="ml-2" />
            </HotkeyButton>
          </div>

          <ScrollArea
            scrollRestorationId={scrollRestorationId}
            className={cn(
              "relative w-full flex-grow",
              "before:absolute before:inset-y-0 before:left-0 before:w-1/5 before:z-10",
              "after:absolute after:inset-y-0 after:right-0 after:w-1/5",
              "before:bg-gradient-to-l before:from-transparent before:to-background",
              "after:bg-gradient-to-r after:from-transparent after:to-background",
              "after:pointer-events-none before:pointer-events-none",
              "after:touch-none before:touch-none",
            )}
          >
            <div
              className={cn(
                "whitespace-nowrap w-max px-[100%]",
                "grid grid-flow-col place-items-center gap-4",
              )}
            >
              {allGroups?.map((group) => (
                <GroupEntry key={group.id} group={group} />
              ))}
            </div>

            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>

          <div className="pl-2 w-full border-l flex justify-end basis-1">
            <HotkeyButton
              variant="ghost"
              hotkey="PAGE_RIGHT"
              className="flex-row-reverse"
              disabled={nextGroup?.id === undefined}
              onClick={() => void handlers.PAGE_RIGHT.handler()}
            >
              <ArrowRight className="mr-2" />
            </HotkeyButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupEntry(props: { group: Group }) {
  const { group } = props;
  const ref = useRef<HTMLAnchorElement>(null!);
  const { activeGroup } = useGroupContext();

  const active = activeGroup?.id === group.id;

  useEffect(() => {
    if (active) {
      setTimeout(() => {
        ref.current?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
        });
      }, 200);
    }
  }, [active, group]);

  return (
    <Link
      ref={ref}
      className={cn(
        "text-2xl font-bold px-4 transition-all uppercase",
        "opacity-30 hover:opacity-75",
        active && "opacity-100 hover:opacity-100",
      )}
      search={{ activeGroupId: group.id }}
    >
      {group.name}
    </Link>
  );
}
