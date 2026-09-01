// Who gets the merchant side of the app.
//
// `users.UserSerializer` returns id/username/email/phone/shops — there is no
// `role` on the User model, so `user.role === "owner"` was never true against
// the real API. Every guard that asked it took the buyer branch: shop creation
// answered 403 to the owner who had just registered, and the onboarding
// redirect could not fire.
//
// Owning a shop is the whole test. Registration creates the user and their
// first shop in one transaction (users/serializers.py) and there is no buyer
// registration endpoint, so on the real backend every account has a shop from
// the moment it exists and this is simply always true.
//
// There is deliberately no `isMerchant` beside this. An earlier version had
// one, defined as `hasShop(user) || user.role === "owner"`, to keep a gate on
// the merchant funnel. Since `role` is never sent, that gate could only ever
// answer "no" to an account without a shop — which is exactly the account the
// funnel exists for. It made POST /api/v1/shops/ unreachable in both
// directions: 403 without a shop, 409 with one.
//
// The consequence to know about: nothing now distinguishes "merchant without a
// shop yet" from "some other kind of account", so a signed-in user with no shop
// is sent to onboarding. That is correct while every account is a merchant. If
// buyer accounts ever become real, this is the file that needs a second test —
// and the backend needs to send something to test.
import type { AuthUser } from "./types";

/** Has a shop to manage right now. */
export function hasShop(user: Pick<AuthUser, "shops">): boolean {
  return Boolean(user.shops?.length);
}
