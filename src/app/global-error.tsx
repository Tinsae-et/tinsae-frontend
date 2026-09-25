"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/observability";

/**
 * Last-resort boundary for errors in the root layout itself, where the normal
 * error page (and its fonts, styles and header) cannot render. It replaces the
 * whole document, so it brings its own <html> and keeps styling inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, "app/global-error");
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#0b0b0b",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 440 }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>Something broke on our side.</h1>
          <p style={{ color: "#555", lineHeight: 1.5 }}>
            Your account and saved listings are safe. Please try again in a moment.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#777" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "12px 20px",
              borderRadius: 999,
              border: 0,
              background: "#cc3000",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
