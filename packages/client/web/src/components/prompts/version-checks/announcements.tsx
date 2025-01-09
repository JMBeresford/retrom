import { useToast } from "@/components/ui/use-toast";
import { parseVersion, versionCompare } from "@/lib/version-utils";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { VersionAnnouncementsPayload } from "@/generated/retrom/utils";
import { useClientVersion } from "@/queries/useClientVersion";
import { Button } from "@/components/ui/button";

const url =
  "https://raw.githubusercontent.com/JMBeresford/retrom/refs/heads/main/version-announcements.json";

export function Announcements() {
  const { data: clientVersion, status } = useClientVersion();
  const { toast } = useToast();

  useQuery({
    enabled: status === "success",
    queryKey: ["version-announcements", clientVersion, toast],
    staleTime: 30000,
    queryFn: async () => {
      if (!clientVersion) {
        return null;
      }

      const res = await fetch(url);

      if (res.ok) {
        const payload = VersionAnnouncementsPayload.fromJSON(await res.json());

        for (const announcement of payload.announcements) {
          for (const versionStr of announcement.versions) {
            const version = parseVersion(versionStr);
            if (!version) continue;

            if (versionCompare(clientVersion, version) === 0) {
              toast({
                title: "Announcement",
                variant:
                  announcement.level === "error" ? "destructive" : "default",
                description: announcement.message,
                action: announcement.url ? (
                  <Button asChild>
                    <Link href={announcement.url} target="_blank">
                      Learn More
                    </Link>
                  </Button>
                ) : undefined,
              });
            }
          }
        }

        return payload;
      }

      return null;
    },
  });

  return <></>;
}
