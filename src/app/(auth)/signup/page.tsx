import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
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
  const to = safeNext(next);

  return (
    <AuthShell>
      <RegisterForm next={to} />
    </AuthShell>
  );
}
