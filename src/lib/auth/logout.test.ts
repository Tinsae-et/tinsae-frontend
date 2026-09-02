import { describe, expect, it, vi } from "vitest";

import { revokeRefreshToken } from "./logout";

let n = 0;
// refreshOnce is keyed by token value and pinned to globalThis, so each test
// needs a token of its own or the cached result leaks across cases.
const uniqueToken = () => `refresh-token-logout-${n++}`;

const driver = (rotated?: { access: string; refresh?: string }) => ({
  logout: vi.fn(async () => {}),
  refresh: vi.fn(async () => rotated ?? { access: "minted", refresh: "rotated" }),
});

describe("revokeRefreshToken", () => {
  it("spends the access token it was given", () => {
    const token = uniqueToken();
    const d = driver();

    return revokeRefreshToken(d, token, "still-valid").then(() => {
      expect(d.refresh).not.toHaveBeenCalled();
      expect(d.logout).toHaveBeenCalledWith("still-valid", token);
    });
  });

  it("still blacklists when the access cookie has already expired", async () => {
    // Regression, and the whole point of the module: the access cookie dies at
    // fifteen minutes and this route is off the proxy matcher, so anyone who
    // idled arrives with only a refresh token. Requiring both silently skipped
    // the backend call and left the token usable for fourteen days.
    const token = uniqueToken();
    const d = driver();

    await revokeRefreshToken(d, token, undefined);

    expect(d.refresh).toHaveBeenCalledWith(token);
    expect(d.logout).toHaveBeenCalledTimes(1);
  });

  it("blacklists the rotated token, not the one it just spent", async () => {
    // ROTATE_REFRESH_TOKENS already revoked the incoming token, so revoking it
    // again is a no-op that leaves the *new* token alive past the logout.
    const token = uniqueToken();
    const d = driver({ access: "minted", refresh: "the-live-one" });

    await revokeRefreshToken(d, token, undefined);

    expect(d.logout).toHaveBeenCalledWith("minted", "the-live-one");
  });

  it("falls back to the original token when the driver does not rotate", async () => {
    // The mock driver returns no `refresh`, which means "nothing to replace".
    const token = uniqueToken();
    const d = driver({ access: "minted" });

    await revokeRefreshToken(d, token, undefined);

    expect(d.logout).toHaveBeenCalledWith("minted", token);
  });

  it("propagates a failed refresh so the caller can log it", async () => {
    const token = uniqueToken();
    const d = {
      logout: vi.fn(async () => {}),
      refresh: vi.fn(async () => {
        throw new Error("token_not_valid");
      }),
    };

    await expect(revokeRefreshToken(d, token, undefined)).rejects.toThrow("token_not_valid");
    expect(d.logout).not.toHaveBeenCalled();
  });
});
