import type { PathHeadingSegment } from "@/routes/app/-components/path-heading";

export const gameHeadingSegments = (opts: {
  platformName: string;
  gameName: string;
  gameId: string;
}): Array<PathHeadingSegment> => [
  { label: "Browse", link: { to: "/app/browse" } },
  {
    label: opts.platformName,
    link: { to: "/app/browse/$platform", from: "/app/browse/$platform/$game/" },
  },
  {
    label: opts.gameName,
    link: {
      to: "/app/browse/$platform/$game",
      params: {
        game: opts.gameId,
      },
    },
  },
];
