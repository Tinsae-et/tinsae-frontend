import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { authDriver, usingMockAuth } from "@/lib/auth/driver";
import { readSession } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

export const metadata: Metadata = { title: "Dashboard — Tinsae" };

/**
 * Placeholder shell, here to make TIN-40's guard and logout provable end to
 * end. Product CRUD, images and the confirm button are the dashboard ticket.
 */
export default async function DashboardPage() {
  const { access } = await readSession();
  if (!access) redirect("/signin?next=/dashboard");

  let user: AuthUser;
  try {
    user = await authDriver.me(access);
  } catch {
    // The middleware refreshes before we get here, so a 401 at this point means
    // the session is genuinely finished rather than merely stale.
    redirect("/signin?next=/dashboard");
  }

  if (user.role === "owner" && (!user.shops || user.shops.length === 0)) {
    redirect("/shop/onboarding");
  }

  const shop = user.shops[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-tn-mono text-[11px] font-bold tracking-[0.14em] text-tn-mute uppercase">
            Signed in
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">
            {shop ? shop.name : user.username}
          </h1>
          {shop ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-tn-mute">
              {shop.city} · {shop.phone}
              {shop.is_verified ? <VerifiedBadge /> : null}
            </p>
          ) : null}
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 rounded-2xl border border-tn-hair bg-white p-6">
        <h2 className="text-lg font-bold">My Products</h2>
        <p className="mt-1.5 text-sm text-tn-mute">
          Nothing here yet — product management arrives with the dashboard ticket.
          This page exists so the route guard, the token refresh and logout can be
          exercised for real.
        </p>
      </div>

      {usingMockAuth ? (
        <p className="mt-6 rounded-xl border border-tn-warn/30 bg-tn-warn/8 px-4 py-3 text-[13px] text-tn-warn">
          Mock auth driver — no Django involved. Set <code>AUTH_DRIVER=http</code>{" "}
          in <code>.env.local</code> to talk to the real API.
        </p>
      ) : null}
    </main>
  );
}
