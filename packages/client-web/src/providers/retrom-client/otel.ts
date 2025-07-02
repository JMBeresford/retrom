import { Interceptor } from "@connectrpc/connect";
import {
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
} from "@opentelemetry/api";

const tracer = trace.getTracer("retrom-client-web/grpc-interceptor");

export const otelInterceptor: Interceptor = (next) => (req) => {
  const name = `retrom.${req.method.parent.name}/${req.method.name}`;

  return new Promise((resolve, reject) =>
    tracer.startActiveSpan(name, { kind: SpanKind.CLIENT }, (span) => {
      span.setAttribute("rpc.system", "grpc");
      span.setAttribute("rpc.service", req.method.parent.name);
      span.setAttribute("rpc.method", req.method.name);
      for (const [key, value] of Object.entries(req.header)) {
        span.setAttribute(`rpc.grpc.request.metadata.${key}`, value as string);
      }

      const output: { traceparent?: string; tracestate?: string } = {};
      propagation.inject(context.active(), output);

      const reqHeaders = [];
      if (output.traceparent) {
        reqHeaders.push("traceparent");
        req.header.set("traceparent", output.traceparent);
      }

      if (output.tracestate) {
        reqHeaders.push("tracestate");
        req.header.set("tracestate", output.tracestate);
      }

      if (reqHeaders.length) {
        const curValue = req.header.get("Access-Control-Request-Headers") ?? "";
        req.header.set(
          "Access-Control-Request-Headers",
          `${reqHeaders.join(", ")}${curValue ? `${curValue}` : ""}`,
        );
      }

      next(req)
        .then(resolve)
        .catch((err) => {
          const error = err instanceof Error ? err : new Error(String(err));
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });

          reject(error);
        })
        .finally(() => {
          span.end();
        });
    }),
  );
};
