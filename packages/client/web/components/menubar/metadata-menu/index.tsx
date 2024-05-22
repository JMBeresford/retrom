import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
} from "@/components/ui/menubar";
import { MatchPlatformsMenuItem } from "./match-platforms-menu-item";
import { getPlatforms } from "@/actions/grpc/platforms";
import { searchIgdb, updatePlatformMetadata } from "@/actions/grpc/metadata";
import { IgdbSearchType, Platform, PlatformMetadata } from "@/generated/retrom";

export type PlatformAndMetadata = Platform & { metadata: PlatformMetadata };

export async function MetadataMenu() {
  const allIgdbPlatforms = await getIgdbPlatforms();
  const currentPlatformMetadata = await getCurrentPlatformMetadata();

  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Metadata
      </MenubarTrigger>

      <MenubarContent>
        <MatchPlatformsMenuItem
          currentPlatformMetadata={currentPlatformMetadata}
          allIgdbPlatforms={allIgdbPlatforms}
          updatePlatformMetadataAction={updatePlatformMetadata}
        />
      </MenubarContent>
    </MenubarMenu>
  );
}

async function getIgdbPlatforms() {
  try {
    const res = await searchIgdb({
      searchType: IgdbSearchType.PLATFORM,
      fields: { include: { value: ["id", "name", "summary"] } },

      // 500 is the maximum limit for the IGDB API, default is 10
      pagination: { limit: 500 },
    });

    const platforms = res.platformMatches?.platforms ?? [];
    platforms.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

    return platforms;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getCurrentPlatformMetadata() {
  try {
    const res = await getPlatforms({ withMetadata: true, ids: [] });
    const { platforms, metadata } = res;

    const platformsWithMetadata: PlatformAndMetadata[] = [];
    for (const platform of platforms) {
      const platformMetadata = metadata.find(
        (m) => m.platformId === platform.id,
      );

      platformsWithMetadata.push({
        ...platform,
        metadata: platformMetadata ?? PlatformMetadata.create(),
      });
    }

    return platformsWithMetadata;
  } catch (e) {
    console.error(e);
    return [];
  }
}
