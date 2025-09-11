import { checkIsDesktop } from "@/lib/env";
import { Button } from "@retrom/ui/components/button";
import { toast } from "@retrom/ui/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect } from "react";

export function LegacyEntry() {
  const { data: usingLegacyEntry } = useQuery({
    staleTime: Infinity,
    queryFn: async () => {
      if (checkIsDesktop()) {
        return false;
      }

      try {
        const res = await fetch("./");
        for (const header of res.headers.keys()) {
          if (header.toLowerCase() === "x-retrom-legacy-entry") {
            return true;
          }
        }

        return false;
      } catch {
        return false;
      }
    },
    queryKey: ["legacy-entry"],
  });

  useLayoutEffect(() => {
    let dismiss: () => unknown;

    if (usingLegacyEntry) {
      dismiss = toast({
        title: "Using Legacy Web Entry",
        duration: Infinity,
        description: (
          <p>
            This way of accessing the web client is deprecated and will be
            removed in the future. Read the migration guide to ensure you do not
            lose access.
          </p>
        ),
        action: (
          <Button>
            <a
              target="_blank"
              href="https://github.com/JMBeresford/retrom/wiki/Migration-Guides#v0730"
            >
              Read more
            </a>
          </Button>
        ),
      }).dismiss;
    }

    return () => {
      dismiss?.();
    };
  }, [usingLegacyEntry]);

  return <></>;
}
