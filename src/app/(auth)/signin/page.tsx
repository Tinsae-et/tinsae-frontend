import type { Metadata } from "next";

import { SignInForm } from "@/components/auth/signin-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { safeNext } from "@/lib/auth/redirects";

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

  return (
    <AuthShell>
      <SignInForm next={safeNext(next)} telegram={false} />
    </AuthShell>
  );
}
