"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  VerificationFieldError,
  VerificationStateResponse,
} from "@/lib/verification";

export function useVerificationStatus(shopSlug: string) {
  const [data, setData] = useState<VerificationStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(shopSlug));
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(
    async (signal?: AbortSignal) => {
      if (!shopSlug) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/shop/${encodeURIComponent(shopSlug)}/verification/state`,
          {
            headers: { Accept: "application/json" },
            signal,
          },
        );
        if (signal?.aborted) return;
        if (!res.ok) {
          throw new Error(`Failed to load verification status (${res.status})`);
        }
        const json = (await res.json()) as VerificationStateResponse;
        if (!signal?.aborted) {
          setData(json);
        }
      } catch (err: unknown) {
        if (signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [shopSlug],
  );

  useEffect(() => {
    if (!shopSlug) {
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    async function run() {
      try {
        const res = await fetch(
          `/api/shop/${encodeURIComponent(shopSlug)}/verification/state`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        if (ignore || controller.signal.aborted) return;
        if (!res.ok) {
          throw new Error(`Failed to load verification status (${res.status})`);
        }
        const json = (await res.json()) as VerificationStateResponse;
        if (!ignore) {
          setData(json);
        }
      } catch (err: unknown) {
        if (ignore || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [shopSlug]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    return fetchStatus();
  }, [fetchStatus]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

export async function submitVerification(
  shopSlug: string,
  supportingDetail: string,
): Promise<VerificationStateResponse> {
  const res = await fetch(
    `/api/shop/${encodeURIComponent(shopSlug)}/verification`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ supporting_detail: supportingDetail }),
    },
  );

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw {
      detail: `Server returned an unexpected response (${res.status}).`,
    } as VerificationFieldError;
  }

  if (!res.ok) {
    throw json as VerificationFieldError;
  }
  return json as VerificationStateResponse;
}
