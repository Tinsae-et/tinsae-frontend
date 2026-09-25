import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/signin-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { homeFor, safeNext } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in — Tinsae",
  description: "Sign in to manage your shop's listings, prices and confirmations.",
};

export default async function SignInPage({
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

  return (
    <AuthShell>
      <SignInForm next={safeNext(next)} telegram={false} />
    </AuthShell>
  );
}
