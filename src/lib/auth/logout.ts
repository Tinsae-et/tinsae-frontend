import { refreshOnce } from "./refresh-lock";
import type { AuthDriver } from "./types";

/**
 * Revokes a refresh token server-side, minting an access token first if the
 * caller has none.
 *
 * Lives here rather than in the route handler for two reasons: Next only allows
 * HTTP verbs and route config to be exported from a `route.ts`, and this is the
 * half worth testing.
 *
 * The access cookie lives fifteen minutes and the refresh cookie fourteen days,
 * and /api/auth/logout is not on the proxy's matcher (/dashboard, /shop,
 * /signin, /signup), so nothing tops up the access token on the way in. Anyone
 * who idled longer than the access lifetime arrives holding a refresh token and
 * nothing else — which is most people who walk away and come back to press Sign
 * out, the exact case this call exists for. An earlier version required both
 * cookies and so skipped them in silence, leaving the token live for a
 * fortnight.
 *
 * POST /auth/logout/ is IsAuthenticated (users/views.py), so a Bearer is not
 * optional and spending one refresh to revoke the session is the price. Note
 * which token is then blacklisted: rotation has already revoked the one we
 * arrived with, so it has to be the replacement, or the live token outlives the
 * logout. Going through `refreshOnce` keeps that rotation from racing a refresh
 * happening in another tab.
 */
export async function revokeRefreshToken(
  driver: Pick<AuthDriver, "logout" | "refresh">,
  refresh: string,
  access?: string,
): Promise<void> {
  if (access) return driver.logout(access, refresh);

  const minted = await refreshOnce(refresh, () => driver.refresh(refresh));
  return driver.logout(minted.access, minted.refresh ?? refresh);
}
