import { EmptyLibraryPrompt } from "./empty-library";
import { LegacyEntry } from "./legacy-entry";
import { TelemetryEnabledPrompt } from "./telemetry";
import { VersionChecks } from "./version-checks";

export function Prompts() {
  return (
    <>
      <EmptyLibraryPrompt />
      <VersionChecks />
      <TelemetryEnabledPrompt />
      <LegacyEntry />
    </>
  );
}
