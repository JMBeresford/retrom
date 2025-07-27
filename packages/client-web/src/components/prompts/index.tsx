import { LegacyEntry } from "./legacy-entry";
import { TelemetryEnabledPrompt } from "./telemetry";
import { VersionChecks } from "./version-checks";

export function Prompts() {
  return (
    <>
      <VersionChecks />
      <TelemetryEnabledPrompt />
      <LegacyEntry />
    </>
  );
}
