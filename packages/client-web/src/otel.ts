import {
  WebTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { configureOpentelemetry } from "@uptrace/web";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from "@opentelemetry/semantic-conventions/incubating";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";

export function initOtel() {
  const contextManager = new ZoneContextManager();
  const propagator = new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  });

  const documentLoadInstrumentation = new DocumentLoadInstrumentation({
    ignoreNetworkEvents: false,
    ignorePerformancePaintEvents: false,
  });

  const fetchInstrumentation = new FetchInstrumentation({
    semconvStabilityOptIn: "http",
  });

  const instrumentations = [documentLoadInstrumentation, fetchInstrumentation];

  const dsn = import.meta.env.VITE_UPTRACE_DSN;

  const version = import.meta.env.VITE_RETROM_VERSION;

  const serviceName =
    import.meta.env.VITE_OTEL_SERVICE_NAME ||
    (import.meta.env.VITE_IS_DESKTOP ? "retrom-client" : "retrom-client-web");

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: version,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: "debug", //import.meta.env.MODE,
  });

  if (dsn) {
    console.log("Using Uptrace OpenTelemetry configuration");

    configureOpentelemetry({
      dsn: import.meta.env.VITE_UPTRACE_DSN,
      contextManager,
      resource,
      textMapPropagator: propagator,
      instrumentations,
    });
  } else {
    const url = new URL("/v1/traces", window.location.origin).toString();
    console.log("Using custom OpenTelemetry configuration: ", url);

    const exporter = new OTLPTraceExporter({
      url,
    });

    const provider = new WebTracerProvider({
      spanProcessors: [new BatchSpanProcessor(exporter)],
      resource,
    });

    provider.register({
      contextManager,
      propagator,
    });

    registerInstrumentations({
      instrumentations,
    });
  }
}

initOtel();
