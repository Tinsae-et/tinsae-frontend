import { describe, expect, it, vi } from "vitest";

import { refreshOnce } from "./refresh-lock";

// The lock is keyed by token value and pinned to globalThis, so tests must not
// share a token or they leak into each other. One counter, one token each.
let n = 0;
const uniqueToken = () => `refresh-token-${n++}`;

const settled = <T,>(p: Promise<T>) => p.then(() => "ok" as const).catch(() => "err" as const);

describe("refreshOnce", () => {
  it("collapses concurrent callers into a single backend call", () => {
    // The reason this module exists: BLACKLIST_AFTER_ROTATION makes a refresh
    // token single-use, so two calls with the same token revoke each other and
    // sign the user out mid-session.
    const token = uniqueToken();
    const rotate = vi.fn(async () => ({ access: "a1", refresh: "r1" }));

    return Promise.all(Array.from({ length: 8 }, () => refreshOnce(token, rotate))).then(
      (results) => {
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(results.every((r) => r.refresh === "r1")).toBe(true);
      },
    );
  });

  it("serves a straggler from the cached result instead of rotating again", async () => {
    // A request that set off before the rotation landed still carries the old
    // token. Rotating for it would blacklist the pair the session is now using.
    const token = uniqueToken();
    const rotate = vi.fn(async () => ({ access: "a2", refresh: "r2" }));

    await refreshOnce(token, rotate);
    const straggler = await refreshOnce(token, rotate);

    expect(rotate).toHaveBeenCalledTimes(1);
    expect(straggler.refresh).toBe("r2");
  });

  it("keeps different tokens independent", async () => {
    const rotate = vi.fn(async () => ({ access: "a3" }));
    await Promise.all([refreshOnce(uniqueToken(), rotate), refreshOnce(uniqueToken(), rotate)]);
    expect(rotate).toHaveBeenCalledTimes(2);
  });

  it("rejects every waiter when the shared call fails", async () => {
    const token = uniqueToken();
    const boom = vi.fn(async () => {
      throw new Error("token_not_valid");
    });

    const outcomes = await Promise.all(
      Array.from({ length: 4 }, () => settled(refreshOnce(token, boom))),
    );

    expect(outcomes).toEqual(["err", "err", "err", "err"]);
    expect(boom).toHaveBeenCalledTimes(1);
  });

  it("does not cache a failure onto the next attempt", async () => {
    // A token rejected because it genuinely expired must not pin that rejection
    // onto a later, legitimate refresh.
    const token = uniqueToken();
    const boom = vi.fn(async () => {
      throw new Error("token_not_valid");
    });

    await settled(refreshOnce(token, boom));
    await settled(refreshOnce(token, boom));

    expect(boom).toHaveBeenCalledTimes(2);
  });

  it("does not wedge later callers behind a refresh that never settles", async () => {
    // Regression: entries were only swept once `completedAt` was set, which only
    // happened on success. A refresh that neither resolved nor rejected stayed
    // in the map forever and every later caller awaited a dead promise.
    vi.useFakeTimers();
    try {
      const token = uniqueToken();
      const hang = vi.fn(() => new Promise<{ access: string }>(() => {}));
      void refreshOnce(token, hang);

      // Past STUCK_MS, the stuck entry must no longer be treated as in flight.
      vi.setSystemTime(Date.now() + 61_000);

      const recovered = await refreshOnce(token, async () => ({ access: "a4" }));
      expect(recovered.access).toBe("a4");
      expect(hang).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
