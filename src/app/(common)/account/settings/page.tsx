import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { authDriver } from "@/lib/auth/driver";
import { AccountSettings } from "@/components/account/account-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings · Tinsae",
  description: "Manage your profile, channels, and account settings on Tinsae.",
};

export default async function SettingsPage() {
  const { access } = await readSession();
  if (!access) {
    redirect("/signin?next=/account/settings");
  }

  let user;
  try {
    user = await authDriver.me(access);
  } catch {
    redirect("/signin?next=/account/settings");
  }

  return <AccountSettings initialUser={user} />;
}
