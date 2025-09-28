import { getFileStub, Image } from "@/lib/utils";
import logo from "@/assets/img/Logo.png";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@retrom/ui/components/chart";
import { useInstallationProgressContext } from "@/providers/installation-progress";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { HTMLAttributes, memo, PropsWithChildren, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useInstallationProgress } from "@/queries/useInstallationProgress";
import { getBestFileSizeOrder, readableByteSize } from "@/utils/files";
import { Separator } from "@retrom/ui/components/separator";
import { match } from "@/utils/typescript";
import { useInstallationIndex } from "@/providers/installation-index";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@retrom/ui/components/card";
import { useInstallationStatus } from "@/queries/useInstallationStatus";
import { cn } from "@retrom/ui/lib/utils";
import { useGames } from "@/queries/useGames";
import { useInstallGame } from "@/mutations/useInstallGame";
import { Button } from "@retrom/ui/components/button";

export const Route = createLazyFileRoute("/(windowed)/_layout/installing")({
  component: RouteComponent,
});

function RouteComponent() {
  const installationProgress = useInstallationProgressContext((s) => s);
  const { installations } = useInstallationIndex();

  const [installing, paused, completed] = useMemo(() => {
    const installing: number[] = [];
    const paused: number[] = [];
    const completed: number[] = [];

    for (const gameId of Object.keys(installations)
      .map(Number)
      .filter((id) => id in installationProgress)) {
      const status = installations[gameId];

      match(status, {
        [InstallationStatus.INSTALLING]: () => installing.push(Number(gameId)),
        [InstallationStatus.PAUSED]: () => paused.push(Number(gameId)),
        [InstallationStatus.INSTALLED]: () => completed.push(Number(gameId)),
        default: () => {},
      });
    }

    return [installing, paused, completed];
  }, [installations, installationProgress]);

  return (
    <main className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Currently Installing
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {installing.length > 0 ? (
            installing.map((gameId) => (
              <InstallationItem key={gameId} gameId={gameId} />
            ))
          ) : (
            <p className="text-muted-foreground">
              No games are currently being installed.
            </p>
          )}
        </CardContent>
      </Card>

      {paused.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Up Next</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {paused.map((gameId) => (
              <InstallationItem key={gameId} gameId={gameId} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {completed.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {completed.map((gameId) => (
              <InstallationItem key={gameId} gameId={gameId} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

function InstallationItem({ gameId }: { gameId: number }) {
  const { data: game } = useGames({
    request: { ids: [gameId] },
    selectFn: (v) => v.games.find((g) => g.id === gameId),
  });

  const { data: metadata, status: fetchStatus } = useGameMetadata({
    request: { gameIds: [gameId] },
    selectFn: (v) => v.metadata.find((m) => m.gameId === gameId),
  });

  const status = useInstallationStatus(gameId);
  const { percentComplete, totalBytes, bytesTransferred } =
    useInstallationProgress(gameId);

  const name = useMemo(
    () => metadata?.name || getFileStub(game?.path),
    [metadata, game],
  );

  const { mutate: install, status: installRequestStatus } =
    useInstallGame(gameId);

  return (
    <div className="relative grid grid-flow-col grid-cols-[auto_1fr] grid-rows-1 gap-4">
      <Link
        to="/games/$gameId"
        params={{ gameId: gameId.toString() }}
        className="relative rounded-lg overflow-hidden border max-h-full h-full aspect-[3/4]"
      >
        {fetchStatus === "pending" ? (
          <div className="w-full h-full grid place-items-center bg-muted">
            <LoaderCircle className="animate-spin w-1/2 h-1/2 text-muted-foreground stroke-1" />
          </div>
        ) : metadata?.coverUrl ? (
          <div className="relative w-full h-full grid place-items-center bg-muted">
            <Image src={logo} className="absolute max-h-1/2 max-w-1/2" />
            <Image
              src={metadata.coverUrl}
              className="absolute max-h-full max-w-full hover:scale-105 transition-transform"
            />
          </div>
        ) : (
          <></>
        )}
      </Link>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <Link
            to="/games/$gameId"
            params={{ gameId: gameId.toString() }}
            className="text-xl font-semibold hover:text-accent transition-colors"
          >
            {name}
          </Link>

          {match(status, {
            [InstallationStatus.INSTALLING]: () => (
              <>
                <Separator orientation="vertical" className="mx-2" />

                <p className="text-muted-foreground font-semibold">
                  {percentComplete}%{" "}
                  <span className="italic text-xs opacity-75 font-normal">
                    ({readableByteSize(bytesTransferred)} /{" "}
                    {readableByteSize(totalBytes)})
                  </span>
                </p>
              </>
            ),
            [InstallationStatus.PAUSED]: () => (
              <>
                <Separator orientation="vertical" className="mx-2" />

                <p className="text-muted-foreground font-semibold">
                  {percentComplete}%{" "}
                  <span className="italic text-xs opacity-75 font-normal">
                    ({readableByteSize(bytesTransferred)} /{" "}
                    {readableByteSize(totalBytes)})
                  </span>
                </p>

                <Button
                  onClick={() => install(undefined)}
                  disabled={installRequestStatus === "pending"}
                  size="sm"
                  variant="outline"
                >
                  Install Now{" "}
                  <LoaderCircle
                    className={cn(
                      "ml-2 h-4 w-4 animate-spin",
                      installRequestStatus !== "pending" && "hidden",
                    )}
                  />
                </Button>
              </>
            ),
            default: () => <></>,
          })}
        </div>

        <div className="relative">
          {match(status, {
            [InstallationStatus.PAUSED]: () => (
              <InstallationProgressChartOverlay>
                Installation Paused
              </InstallationProgressChartOverlay>
            ),
            [InstallationStatus.INSTALLED]: () => (
              <InstallationProgressChartOverlay>
                Installation Complete
              </InstallationProgressChartOverlay>
            ),
            [InstallationStatus.FAILED]: () => (
              <InstallationProgressChartOverlay className="text-destructive-text">
                Installation Failed
              </InstallationProgressChartOverlay>
            ),
            default: () => <></>,
          })}

          <InstallationProgressChart gameId={gameId} />
        </div>
      </div>
    </div>
  );
}

const InstallationProgressChartOverlay = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div
    {...props}
    className={cn(
      "absolute inset-0 bg-background/50 z-10 grid place-items-center",
      "text-3xl font-semibold text-muted-foreground",
      className,
    )}
  >
    <h3>{children}</h3>
  </div>
);

type ChartDatum = {
  speed: number;
  percent: number;
};
const InstallationProgressChart = memo(function ({
  gameId,
}: {
  gameId: number;
}) {
  const updates = useInstallationProgressContext((s) => s[gameId] ?? []);

  const data = useMemo(() => {
    const data: ChartDatum[] = Array.from({ length: 101 }).map((_, i) => {
      const update = updates.find(
        (u) =>
          u.metrics?.percentComplete !== undefined &&
          u.metrics.percentComplete >= i,
      );

      if (update?.metrics) {
        return {
          speed: update.metrics.bytesPerSecond,
          percent: i,
        };
      }

      return { speed: 0, percent: i };
    });

    return data;
  }, [updates]);

  const chartConfig = {
    updatedAt: {
      label: "Time",
      color: "var(--color-foreground)",
    },
    speed: {
      label: "Speed",
      color: "var(--color-accent)",
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
        </defs>

        <CartesianGrid syncWithTicks />

        <XAxis
          type="number"
          dataKey="percent"
          unit="%"
          domain={[0, 100]}
          allowDataOverflow
          axisLine={false}
          tickLine={false}
          interval="preserveStart"
          ticks={[25, 50, 75]}
          fontSize={12}
        />

        <YAxis
          padding={{ top: 12 }}
          orientation="right"
          allowDataOverflow
          dataKey="speed"
          yAxisId="speed"
          axisLine={false}
          tickLine={false}
          tickCount={3}
          interval="preserveEnd"
          fontSize={12}
          tickFormatter={(value: number) => {
            if (value === 0) return "";

            const order = getBestFileSizeOrder(value / 10);
            return `${readableByteSize(value, order)}/s`;
          }}
        />

        <Area
          dataKey="speed"
          animationDuration={250}
          animationEasing="linear"
          // isAnimationActive={false}
          fill="url(#fillSpeed)"
          type="basis"
          stroke="var(--color-speed)"
          yAxisId="speed"
          stackId="a"
        />

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(v, name, item) => {
                if (typeof v === "number") {
                  return (
                    <>
                      <div
                        style={{ backgroundColor: item.color }}
                        className={cn("w-2.5 h-2.5 rounded-xs")}
                      ></div>
                      <span className="capitalize">{name}:</span>{" "}
                      {readableByteSize(v)}/s
                    </>
                  );
                }

                return v;
              }}
            />
          }
        />
      </AreaChart>
    </ChartContainer>
  );
});
