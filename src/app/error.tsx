"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/observability";
import NotFound from "./(common)/not-found";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, "app/error");
  }, [error]);

  return <NotFound kind="500" reference={error.digest} onRetry={reset} />;
}
