"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // replace(), not push() — the dashboard should not be one Back away from a
    // signed-out user. refresh() drops the server-rendered session state too.
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="h-9 shrink-0 rounded-[11px] border-[1.5px] border-tn-hair bg-white px-3.5 text-[13px] font-bold text-tn-ink2 transition-colors hover:border-tn-red hover:text-tn-red disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
