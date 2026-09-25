import { requireSession } from "@/lib/auth/session";
import { AccountSettings } from "@/components/account/account-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings · Tinsae",
  description: "Manage your profile, channels, and account settings on Tinsae.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const { user } = await requireSession("/account/settings");

  return <AccountSettings initialUser={user} />;
}
