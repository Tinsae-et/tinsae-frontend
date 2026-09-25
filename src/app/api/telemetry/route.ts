import { NextResponse } from "next/server";

import { rejectCrossOrigin } from "@/lib/auth/route-helpers";
import { emit, type TelemetryEvent } from "@/lib/observability";

/** Larger bodies are not telemetry. */
const MAX_BYTES = 4_096;

const VITALS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

/**
 * Receives browser errors and Web Vitals (lib/observability) and writes them
 * to the server log.
 *
 * Unauthenticated by nature, so it only ever logs a fixed, truncated shape:
 * same-origin only, capped in size, fields whitelisted. Nothing is stored or
 * echoed back.
 */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const text = await request.text();
  if (text.length > MAX_BYTES) return new NextResponse(null, { status: 413 });

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const path = typeof raw.path === "string" ? raw.path.slice(0, 200) : undefined;
  let event: TelemetryEvent | null = null;

  if (raw.type === "error" && typeof raw.message === "string") {
    event = {
      type: "error",
      message: raw.message.slice(0, 500),
      digest: typeof raw.digest === "string" ? raw.digest.slice(0, 64) : undefined,
      where: `client ${typeof raw.where === "string" ? raw.where.slice(0, 100) : "unknown"}`,
      path,
    };
  } else if (
    raw.type === "vital" &&
    typeof raw.name === "string" &&
    VITALS.has(raw.name) &&
    typeof raw.value === "number" &&
    Number.isFinite(raw.value)
  ) {
    event = {
      type: "vital",
      name: raw.name,
      value: Math.round(raw.value * 1000) / 1000,
      rating: typeof raw.rating === "string" ? raw.rating.slice(0, 20) : undefined,
      path,
    };
  }

  if (!event) return new NextResponse(null, { status: 400 });
  emit(event);
  return new NextResponse(null, { status: 204 });
}
