"use client";

import { useReportWebVitals } from "next/web-vitals";

import { emit } from "@/lib/observability";

/**
 * Real-user Core Web Vitals, from buyers' actual phones and networks.
 *
 * Lab tools (Lighthouse) cannot tell you why 5% of users find a page slow;
 * these can, once grouped by `path` in the logs.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    emit({ type: "vital", name: metric.name, value: metric.value, rating: metric.rating });
  });
  return null;
}
