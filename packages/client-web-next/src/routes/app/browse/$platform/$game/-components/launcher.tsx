import { cn } from "@retrom/ui-next/lib/utils";
import { Button } from "@retrom/ui-next/components/button";
import { ChevronDown, Loader2, PlayIcon } from "lucide-react";
import { useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@retrom/ui-next/components/combobox";
import { Field, FieldLabel } from "@retrom/ui-next/components/field";
import { Link } from "@tanstack/react-router";
import { Separator } from "@retrom/ui-next/components/separator";
import { Route } from "..";
import { LauncherContext, useLauncherContext } from "./launcher-context";
import type { HTMLAttributes, PropsWithChildren } from "react";
import type { LauncherContextValue } from "./launcher-context";
import { useListEmulators } from "@/data/emulators/use-list-emulators";
import { useListEmulatorProfiles } from "@/data/emulators/use-list-emulator-profiles";
import { useListDefaultEmulatorProfiles } from "@/data/emulators/use-list-default-emulator-profiles";

export type LauncherCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
>;

export function Launcher({ className, ...props }: LauncherCardProps) {
  return (
    <div className={cn("flex gap-4", className)} {...props}>
      <Button size="lg" className="px-6 h-full font-bold text-xl">
        <PlayIcon className="size-5 fill-primary-foreground" /> PLAY
      </Button>

      <EmulatorSelect className="basis-0 grow" />
      <EmulatorProfileSelect className="basis-0 grow" />
    </div>
  );
}

export function LauncherContextProvider({ children }: PropsWithChildren) {
  const { game, platform } = Route.useParams();
  const value = useState<LauncherContextValue>({
    gameId: game,
    platformId: platform,
  });

  return (
    <LauncherContext.Provider value={value}>
      {children}
    </LauncherContext.Provider>
  );
}

function EmulatorSelect({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [state, setState] = useLauncherContext();

  const emulatorsQuery = useListEmulators({
    request: {
      supportedPlatformIds: [state.platformId],
    },
    options: {
      select: (response) =>
        response.emulators.map((e) => ({ label: e.name, value: e.id })),
    },
  });

  if (emulatorsQuery.isError) {
    return <p className="text-destructive text-sm">Error loading emulators.</p>;
  }

  return (
    <Field className={cn(className)} {...props}>
      <FieldLabel>Emulator</FieldLabel>

      <Combobox
        items={emulatorsQuery.data}
        value={state.emulatorId ?? null}
        onValueChange={(item) =>
          item &&
          setState((prev) => ({
            ...prev,
            emulatorId: item,
            emulatorProfileId: undefined,
          }))
        }
      >
        <ComboboxTrigger
          render={
            <Button
              variant="outline"
              className={cn("justify-between font-normal")}
            >
              <ComboboxValue placeholder="Select an emulator" />
              <ChevronDown />
            </Button>
          }
        />

        <ComboboxContent>
          <div className="p-2 flex flex-col gap-2">
            <ComboboxInput
              showTrigger={false}
              placeholder="Search for an emulator"
            />

            <Separator />
          </div>

          <ComboboxEmpty>
            <span className="py-2 px-4 text-pretty">
              No valid emulators found. Please{" "}
              <Link className="text-primary underline" to="/app/emulators">
                configure an emulator
              </Link>{" "}
              for this platform.
            </span>
          </ComboboxEmpty>

          <ComboboxList>
            {(item: { label: string; value: string }) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

function EmulatorProfileSelect({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [state, setState] = useLauncherContext();

  const defaultProfileQuery = useListDefaultEmulatorProfiles({
    request: {
      platformIds: [state.platformId],
    },
    options: {
      select: (response) =>
        response.defaultEmulatorProfiles.at(0)?.emulatorProfile ?? null,
    },
  });

  const profilesQuery = useListEmulatorProfiles({
    request: {
      emulatorIds: state.emulatorId !== undefined ? [state.emulatorId] : [],
    },
    options: {
      enabled: state.emulatorId !== undefined,
      select: (response) =>
        response.emulatorProfiles.map((profile) => ({
          label: profile.name,
          value: profile.id,
        })),
    },
  });

  const isPending = profilesQuery.isFetching || defaultProfileQuery.isPending;
  const isError = profilesQuery.isError || defaultProfileQuery.isError;

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        Error loading emulator profiles.
      </p>
    );
  }

  return (
    <Field className={cn(className)} {...props}>
      <FieldLabel>Emulator Profile</FieldLabel>

      <Combobox
        items={profilesQuery.data}
        defaultValue={defaultProfileQuery.data ?? null}
        value={state.emulatorProfileId ?? null}
        onValueChange={(item) =>
          item && setState((prev) => ({ ...prev, emulatorProfileId: item }))
        }
      >
        <ComboboxTrigger
          disabled={state.emulatorId === undefined || isPending}
          render={
            <Button
              variant="outline"
              className={cn("justify-between font-normal")}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ComboboxValue placeholder="Select a profile" />
              )}
              <ChevronDown />
            </Button>
          }
        />

        {state.emulatorId && (
          <ComboboxContent>
            <div className="p-2 flex flex-col gap-2">
              <ComboboxInput
                showTrigger={false}
                placeholder="Search for a profile"
              />

              <Separator />
            </div>

            <ComboboxEmpty>
              <span className="py-2 px-4 text-pretty">
                No valid emulator profiles found. Please{" "}
                <Link
                  className="text-primary underline"
                  to="/app/emulators/$emulator-id"
                  params={{ "emulator-id": state.emulatorId }}
                >
                  configure the emulator
                </Link>{" "}
                to add a profile.
              </span>
            </ComboboxEmpty>

            <ComboboxList>
              {(item: { label: string; value: string }) => (
                <ComboboxItem key={item.value} value={item.value}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        )}
      </Combobox>
    </Field>
  );
}
