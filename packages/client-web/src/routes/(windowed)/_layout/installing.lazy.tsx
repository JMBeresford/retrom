import { Image } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@retrom/ui/components/chart";
import { useInstallationProgressContext } from "@/providers/installation-progress";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { createLazyFileRoute } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { memo, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { timestampDate } from "@bufbuild/protobuf/wkt";

export const Route = createLazyFileRoute("/(windowed)/_layout/installing")({
  component: RouteComponent,
});

function RouteComponent() {
  const installations = useInstallationProgressContext((s) => Object.keys(s));

  return (
    <main className="flex flex-col gap-4">
      <h3 className="text-3xl font-bold">Game Installations</h3>

      {installations.map((gameId) => (
        <InstallationItem key={gameId} gameId={Number(gameId)} />
      ))}
    </main>
  );
}

function InstallationItem({ gameId }: { gameId: number }) {
  const { data, status } = useGameMetadata({
    request: { gameIds: [gameId] },
    selectFn: (v) => v.metadata.find((m) => m.gameId === gameId),
  });

  return (
    <div className="relative grid grid-flow-col grid-cols-[auto_1fr] grid-rows-1 gap-4">
      <div className="relative rounded-lg overflow-hidden border-2 max-h-full h-full aspect-[3/4]">
        {status === "pending" ? (
          <LoaderCircle className="animate-spin" />
        ) : data?.coverUrl ? (
          <Image
            src={data.coverUrl}
            className="absolute max-h-full max-w-full"
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <p className="text-lg">{data?.name}</p>

        <InstallationProgressChart gameId={gameId} />
      </div>
    </div>
  );
}

type ChartDatum = {
  updatedAt: string;
  speed: number;
  downloaded: number;
  percent: number;
};
const InstallationProgressChart = memo(function ({
  gameId,
}: {
  gameId: number;
}) {
  const updates = useInstallationProgressContext((s) => s[gameId] ?? []);

  const data = useMemo(() => {
    const data: ChartDatum[] = [];

    for (const update of updates) {
      if (update.metrics && update.updatedAt) {
        const { metrics, updatedAt } = update;
        data.push({
          updatedAt: timestampDate(updatedAt).toLocaleTimeString("en-US", {
            formatMatcher: "best fit",
          }),
          speed: metrics.bytesPerSecond / 125_000,
          downloaded: Number(metrics.bytesTransferred / 125_000n),
          percent: metrics.percentComplete,
        });
      }
    }

    return data;
  }, [updates]);

  const chartConfig = {
    updatedAt: {
      label: "Time",
    },
    speed: {
      label: "Speed (Mbps)",
      color: "var(--color-accent)",
    },
    downloaded: {
      label: "Downloaded (MB)",
      color: "var(--color-primary)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-40 w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillSpeed" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-speed)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-speed)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillDownloaded" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-downloaded)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-downloaded)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} />

        <XAxis
          type="number"
          interval="preserveStartEnd"
          dataKey="percent"
          domain={["dataMax - 100", 100]}
          hide
        />

        <YAxis orientation="left" yAxisId="speed" hide />

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />

        <Area
          dataKey="speed"
          isAnimationActive={false}
          autoReverse
          type="bumpX"
          fill="url(#fillSpeed)"
          stroke="var(--color-speed)"
          yAxisId="speed"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
});
