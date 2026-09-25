// One place where errors and performance signals leave the app.
//
// Today everything lands in the server's structured logs (one JSON object per
// line, so any log platform can search it): server errors via
// instrumentation.ts, browser errors and Web Vitals via a beacon to
// /api/telemetry. When an error-tracking service (Sentry or similar) is chosen,
// wire it in here and in instrumentation.ts — no call site needs to change.

export type TelemetryEvent =
  | {
      type: "error";
      message: string;
      digest?: string;
      where: string;
      path?: string;
    }
  | {
      type: "vital";
      name: string;
      value: number;
      rating?: string;
      path?: string;
    };

/** Emits one structured log line (server) or beacons it to the server (browser). */
export function emit(event: TelemetryEvent): void {
  if (typeof window === "undefined") {
    const line = JSON.stringify({ ts: new Date().toISOString(), source: "server", ...event });
    if (event.type === "error") console.error(line);
    else console.log(line);
    return;
  }

  const body = JSON.stringify({ ...event, path: event.path ?? window.location.pathname });
  try {
    // sendBeacon survives the page unloading, which is exactly when a
    // crashed page or a final LCP/INP value tends to be reported.
    if (navigator.sendBeacon?.(
      "/api/telemetry",
      new Blob([body], { type: "application/json" }),
    )) {
      return;
    }
    void fetch("/api/telemetry", {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
    });
  } catch {
    // Telemetry must never break the page it is reporting on.
  }
}

/** Reports an error caught by an error boundary or a catch block. */
export function reportError(error: unknown, where: string): void {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest)
      : undefined;
  emit({ type: "error", message: message.slice(0, 500), digest, where });
}
