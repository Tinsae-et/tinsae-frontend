"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({
  variant = "button",
  className,
}: {
  variant?: "button" | "nav";
  className?: string;
}) {
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

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        className={cn(
          "w-full flex items-center gap-[11px] px-3 py-[10px] my-[2px] rounded-[11px] text-[13.5px] font-semibold text-tn-ink2 hover:bg-tn-red-soft hover:text-tn-red transition-colors cursor-pointer disabled:opacity-60 text-left",
          className
        )}
      >
        <LogOut className="size-[17px] shrink-0 text-tn-mute" />
        <span>{pending ? "Signing out…" : "Sign out"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className={cn(
        "h-9 shrink-0 rounded-[11px] border-[1.5px] border-tn-hair bg-white px-3.5 text-[13px] font-bold text-tn-ink2 transition-colors hover:border-tn-red hover:text-tn-red disabled:opacity-60 cursor-pointer",
        className
      )}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
