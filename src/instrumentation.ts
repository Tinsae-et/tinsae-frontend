import type { Instrumentation } from "next";

import { emit } from "@/lib/observability";

/**
 * Every error the Next server captures — in rendering, route handlers or the
 * proxy — as one structured log line with the route it happened on.
 *
 * The `digest` is what the error page shows the user as a reference, so a
 * support report can be matched to its log line. See lib/observability for
 * where an error-tracking service plugs in.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const message = err instanceof Error ? err.message : String(err);
  const digest =
    typeof err === "object" && err !== null && "digest" in err ? String(err.digest) : undefined;

  emit({
    type: "error",
    message,
    digest,
    where: `${context.routeType} ${context.routePath}`,
    path: `${request.method} ${request.path}`,
  });
};
