// Makes concurrent refreshes of the same token safe.
//
// The backend rotates: ROTATE_REFRESH_TOKENS mints a replacement on every
// refresh and BLACKLIST_AFTER_ROTATION revokes the one just spent
// (config/settings/base.py). A refresh token is therefore single-use, and two
// requests presenting the same one are not a race that resolves itself — the
// first wins and the second gets a 401 for a token that was valid when it was
// sent. The user is signed out mid-session for doing nothing wrong.
//
// This is easy to trigger without any unusual behaviour: the access cookie
// expires on its own schedule, so a page that fires several requests at once
// after a quiet spell sends several identical refreshes.
//
// Two requests, both needed:
//
//  - *In flight* — everyone waiting on the same token awaits one call.
//  - *Just finished* — the answer is kept for a few seconds afterwards. A
//    request that set off before the rotation landed still carries the old
//    token in its cookie header, arrives late, and would otherwise present a
//    token that is now blacklisted. Serving it the same fresh pair is correct:
//    it proved it held the token, and it is the same session either way.
//
// Scope is one server process. A multi-instance deployment can still rotate the
// same token twice, so this narrows the window rather than closing it; closing
// it needs shared state (Redis) or a grace period on the backend.
import { createHash } from "node:crypto";
import type { RefreshResult } from "./types";

/** How long a completed refresh stays available to stragglers. */
const RESULT_TTL_MS = 10_000;

/**
 * When an in-flight entry stops being treated as in flight.
 *
 * Only reachable if a refresh neither resolves nor rejects, which the driver's
 * own request timeout should already prevent. Without it such an entry is never
 * swept — `completedAt` is set on success only — and every later caller with
 * that token awaits a promise that will not settle. Well above the driver
 * timeout, so in normal failures the reject path cleans up first and this never
 * fires; when it does fire the request is long dead and a second attempt is
 * better than a wedged session.
 */
const STUCK_MS = 60_000;

type Entry = {
  promise: Promise<RefreshResult>;
  startedAt: number;
  /** Set when the promise resolves; absent while still in flight. */
  completedAt?: number;
};

// globalThis for the same reason mock-driver.ts uses it: route handlers and
// Server Components compile into separate module graphs, and a module-scoped
// Map would give each its own copy — which is no lock at all.
const store = globalThis as typeof globalThis & {
  __tinsaeRefreshLock?: Map<string, Entry>;
};

const inflight = (store.__tinsaeRefreshLock ??= new Map<string, Entry>());

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sweep(now: number): void {
  for (const [key, entry] of inflight) {
    const expired =
      entry.completedAt !== undefined
        ? now - entry.completedAt > RESULT_TTL_MS
        : now - entry.startedAt > STUCK_MS;
    if (expired) inflight.delete(key);
  }
}

/**
 * Runs `refresh` at most once per refresh token, and shares the result.
 *
 * Failures are never cached: a token rejected because it genuinely expired must
 * not pin that rejection onto a later, legitimate attempt.
 */
export function refreshOnce(
  token: string,
  refresh: () => Promise<RefreshResult>,
): Promise<RefreshResult> {
  const key = hashToken(token);
  const now = Date.now();
  sweep(now);

  const existing = inflight.get(key);
  if (existing) return existing.promise;

  const entry: Entry = {
    startedAt: now,
    promise: refresh().then(
      (result) => {
        entry.completedAt = Date.now();
        return result;
      },
      (error: unknown) => {
        inflight.delete(key);
        throw error;
      },
    ),
  };

  inflight.set(key, entry);
  return entry.promise;
}
