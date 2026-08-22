import type { Metadata } from "next";

import { SignInForm } from "@/components/auth/signin-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { safeNext } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Sign in — Tinsae",
  description: "Sign in to Tinsae with Telegram or your phone number.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell>
      <SignInForm next={safeNext(next)} />
    </AuthShell>
  );
}
