import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { configStore } from "./providers/config";

const contextManager = new ZoneContextManager();
const documentLoadInstrumentation = new DocumentLoadInstrumentation();
const dsn = import.meta.env.VITE_UPTRACE_DSN;

const version = import.meta.env.VITE_RETROM_VERSION;

const serviceName =
  import.meta.env.VITE_OTEL_SERVICE_NAME ||
  (import.meta.env.VITE_IS_DESKTOP ? "retrom-client" : "retrom-client-web");

const enabled = configStore.getState().telemetry?.enabled;

if (enabled) {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: import.meta.env.MODE,
  });

  if (dsn) {
    console.log("Using Uptrace OpenTelemetry configuration");
    const { configureOpentelemetry } = await import("@uptrace/web").then(
      ({ configureOpentelemetry }) => ({
        configureOpentelemetry,
      }),
    );

    configureOpentelemetry({
      dsn: import.meta.env.VITE_UPTRACE_DSN,
      contextManager,
      resource,
    });
  } else {
    console.log("Using custom OpenTelemetry configuration");
    const OTLPTraceExporter = await import(
      "@opentelemetry/exporter-trace-otlp-http"
    ).then(({ OTLPTraceExporter }) => OTLPTraceExporter);

    const url = new URL("http://localhost:3000/v1/traces").toString();

    const exporter = new OTLPTraceExporter({
      url,
    });

    const provider = await import("@opentelemetry/sdk-trace-web").then(
      ({ WebTracerProvider, BatchSpanProcessor }) =>
        new WebTracerProvider({
          spanProcessors: [new BatchSpanProcessor(exporter)],
          resource,
        }),
    );

    provider.register({
      contextManager,
    });
  }

  registerInstrumentations({
    instrumentations: [documentLoadInstrumentation],
  });
}
