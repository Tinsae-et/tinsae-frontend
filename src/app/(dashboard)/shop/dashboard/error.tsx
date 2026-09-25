"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/observability";

/**
 * Errors in a dashboard section render inside the shell, so the merchant keeps
 * the sidebar and can move to another section instead of losing the whole
 * dashboard.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, "dashboard/error");
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-[520px] rounded-[18px] border border-tn-hair bg-white p-8 text-center">
      <h2 className="text-xl font-extrabold text-tn-ink">This section couldn&apos;t load.</h2>
      <p className="mt-2 text-sm text-tn-ink2">
        Tinsae may be having trouble reaching the server. Your listings are safe.
      </p>
      {error.digest && (
        <p className="font-tn-mono mt-3 text-xs text-tn-mute">Reference: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="bg-tn-red mt-6 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
