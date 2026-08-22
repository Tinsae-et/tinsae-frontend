import type { Metadata } from "next";

import { SignUpFlow } from "@/components/auth/signup-flow";
import { AuthShell } from "@/components/auth/auth-shell";
import { safeNext } from "@/lib/auth/redirects";

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

  return (
    <AuthShell>
      <SignUpFlow next={safeNext(next)} />
    </AuthShell>
  );
}
