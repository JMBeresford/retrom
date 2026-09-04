import { browseHeadingSegments } from "../../-components/browse-heading";
import type { PathHeadingSegment } from "@/routes/app/-components/path-heading";

export const platformHeadingSegments = (
  platformId: string = "",
  platformName: string = "",
): Array<PathHeadingSegment> => [
  ...browseHeadingSegments,
  {
    label: platformName,
    link: {
      to: "/app/browse/$platform",
      params: {
        platform: platformId,
      },
    },
  },
];
