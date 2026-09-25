import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { homeFor, safeNext } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create your account — Tinsae",
  description: "Join Tinsae to save listings and message verified shops.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Already signed in? Only when /me/ confirms it — cookie presence alone
  // proves nothing, and trusting it caused a redirect loop. A failed /me/
  // returns null, so this page renders instead of bouncing.
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next) ?? homeFor(user));
  const to = safeNext(next);

  return (
    <AuthShell>
      <RegisterForm next={to} />
    </AuthShell>
  );
}
