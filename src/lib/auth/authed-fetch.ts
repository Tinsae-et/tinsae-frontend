import { cookies } from "next/headers";

import { authDriver } from "./driver";
import { refreshOnce } from "./refresh-lock";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./session";

/**
 * Calls the Django API as the signed-in user, from server code only.
 *
 * This is the seam that lets client components stop handling tokens. Before it,
 * every authenticated call took an access token as an argument, which meant a
 * Server Component had to read the session and pass the JWT down as a prop —
 * serialising it into the RSC payload, where anyone viewing source could read
 * it. That defeats the httpOnly cookies entirely (see ./session for why they
 * are httpOnly in the first place), and an argument that is easy to forget is
 * easy to get wrong: one dashboard panel shipped with the literal string
 * "sdasd" where a token belonged, and it looked like an empty list rather than
 * an error.
 *
 * A 401 is retried exactly once, behind the same per-token lock the proxy uses,
 * so a page issuing several parallel calls on a just-expired access token
 * refreshes once rather than racing to revoke its own rotated refresh token.
 */
export type AuthedResult =
  | {
      ok: true;
      response: Response;
      /** Set when the retry path minted new tokens; the caller must store them. */
      rotated?: { access: string; refresh?: string };
    }
  | { ok: false; reason: "no-session" | "expired" };

const REQUEST_TIMEOUT_MS = 10_000;

export async function authedFetch(url: string, init: RequestInit = {}): Promise<AuthedResult> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;

  // No refresh token means no session to recover — the access cookie expires
  // first by design, so its absence alone proves nothing.
  if (!refresh) return { ok: false, reason: "no-session" };

  if (access) {
    const first = await send(url, init, access);
    if (first.status !== 401) return { ok: true, response: first };
  }

  let renewed: { access: string; refresh?: string };
  try {
    renewed = await refreshOnce(refresh, () => authDriver.refresh(refresh));
  } catch {
    return { ok: false, reason: "expired" };
  }

  const second = await send(url, init, renewed.access);
  return { ok: true, response: second, rotated: renewed };
}

function send(url: string, init: RequestInit, token: string): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}
