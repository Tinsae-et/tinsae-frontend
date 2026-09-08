"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Send,
  Bell,
  ShieldCheck,
  Key,
  LogOut,
  Pencil,
  MapPin,
  Check,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth/types";
import { normalizeImageUrl } from "@/lib/format";

type TabKey = "profile" | "channels" | "notifications" | "security" | "account";

interface AccountSettingsProps {
  initialUser: AuthUser;
}

export function AccountSettings({ initialUser }: AccountSettingsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [user, setUser] = useState<AuthUser>(initialUser);
  // Do not prefill full_name with username -- keep it blank if unset so placeholder shows username
  const [formData, setFormData] = useState({
    full_name: initialUser.full_name || "",
    preferred_area: initialUser.preferred_area || "",
    telegram_username: initialUser.telegram_username || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    normalizeImageUrl(initialUser.avatar) || null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Derive initials for avatar fallback (e.g. "Hanna Alemu" -> "HA")
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Format member since date (e.g. "March 2025")
  const formatMemberSince = (dateStr?: string) => {
    if (!dateStr) return "March 2025";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return "March 2025";
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: "Image must be smaller than 2 MB.",
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      let res: Response;
      if (avatarFile) {
        const body = new FormData();
        body.append("full_name", formData.full_name.trim());
        body.append("preferred_area", formData.preferred_area.trim());
        body.append(
          "telegram_username",
          formData.telegram_username.trim().replace(/^@/, ""),
        );
        body.append("avatar", avatarFile);

        res = await fetch("/api/auth/me", {
          method: "PATCH",
          body,
        });
      } else {
        res = await fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.full_name.trim(),
            preferred_area: formData.preferred_area.trim(),
            telegram_username: formData.telegram_username.trim().replace(/^@/, ""),
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.avatar?.[0] ||
            data.detail ||
            data.fieldErrors?.full_name?.[0] ||
            data.fieldErrors?.preferred_area?.[0] ||
            "Failed to update profile",
        );
      }

      if (data.user) {
        setUser(data.user);
      }
      setAvatarFile(null);
      setFeedback({
        type: "success",
        message: "Profile changes saved successfully.",
      });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong while saving changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || "",
      preferred_area: user.preferred_area || "",
      telegram_username: user.telegram_username || "",
    });
    setAvatarPreview(user.avatar || null);
    setAvatarFile(null);
    setFeedback(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/signin");
      router.refresh();
    } catch {
      router.push("/signin");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = formData.full_name || user.full_name || user.username || "User";
  const initials = getInitials(displayName);
  const telegramTag = formData.telegram_username || user.telegram_username || user.username || "user";

  return (
    <div className="min-h-screen bg-[#faf9f8] pb-24 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-neutral-500">
          <Link href="/" className="hover:text-neutral-800 transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-600">{displayName.split(" ")[0]}</span>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-900 font-semibold">Settings</span>
        </nav>

        {/* User Hero Banner */}
        <div className="mb-8 flex items-center gap-5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1e40af] text-2xl font-bold text-white shadow-sm ring-4 ring-white">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={displayName}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                unoptimized={avatarPreview.startsWith("blob:")}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              {displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-neutral-500">
              {user.phone && <span>{user.phone}</span>}
              {user.phone && <span>·</span>}
              <span className="flex items-center gap-1 text-neutral-600 font-medium">
                <Send className="h-3.5 w-3.5 text-[#0284c7]" />
                @{telegramTag}
              </span>
              <span>·</span>
              <span>Member since {formatMemberSince(user.date_joined)}</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-3">
            <div className="sticky top-6 flex flex-col space-y-1 rounded-2xl bg-white p-3 border border-neutral-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "profile"
                    ? "bg-[#fff7ed] text-[#ea580c] font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <UserIcon className="h-4 w-4 shrink-0" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("channels")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "channels"
                    ? "bg-[#fff7ed] text-[#ea580c] font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Send className="h-4 w-4 shrink-0" />
                <span>Channels</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "notifications"
                    ? "bg-[#fff7ed] text-[#ea580c] font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Bell className="h-4 w-4 shrink-0" />
                <span>Notifications</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "security"
                    ? "bg-[#fff7ed] text-[#ea580c] font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Privacy & security</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === "account"
                    ? "bg-[#fff7ed] text-[#ea580c] font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Key className="h-4 w-4 shrink-0" />
                <span>Account</span>
              </button>

              <div className="my-2 border-t border-neutral-100" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                ) : (
                  <LogOut className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-rose-600" />
                )}
                <span>Sign out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-9 space-y-6">
            {feedback && (
              <div
                className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {feedback.type === "success" ? (
                  <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Card 1: Profile Details */}
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                      Profile
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                      This is how verified shops see you when you message them.
                    </p>
                  </div>

                  {/* Avatar Upload Row */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1e40af] text-xl font-bold text-white shadow-xs">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt={displayName}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                          unoptimized={avatarPreview.startsWith("blob:")}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs transition active:scale-98"
                      >
                        <Pencil className="h-3.5 w-3.5 text-neutral-500" />
                        <span>Change photo</span>
                      </button>
                      <p className="mt-1.5 text-xs text-neutral-400">
                        JPG or PNG, up to 2 MB.
                      </p>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        placeholder={user.username || "Hanna Alemu"}
                        className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/10"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-neutral-700">
                          Preferred area
                        </label>
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      </div>
                      <input
                        type="text"
                        value={formData.preferred_area}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferred_area: e.target.value,
                          })
                        }
                        placeholder="e.g. Bole · Atlas"
                        className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/10"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Telegram username (optional)
                      </label>
                      <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-neutral-400">
                          @
                        </span>
                        <input
                          type="text"
                          value={formData.telegram_username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telegram_username: e.target.value.replace(/^@/, ""),
                            })
                          }
                          placeholder="username"
                          className="w-full rounded-xl border border-neutral-300 pl-8 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/10"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400">
                        Handle without the @. Unverified — for display only.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Contact Information (Read-Only) */}
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                      Contact
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                      Used for OTP sign-in and shop replies.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={user.phone || "Not set"}
                        className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700">
                        Email
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={user.email || "Not set"}
                        className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-500">
                    Changing your phone number or email will require OTP verification (coming soon).
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200/60 transition active:scale-98"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#ea580c] px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#c2410c] transition active:scale-98 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Save changes</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "channels" && (
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">
                  Connected Channels
                </h2>
                <p className="text-sm text-neutral-500">
                  Manage communication channels linked to your Tinsae account.
                </p>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-[#0284c7]" />
                    <div>
                      <div className="font-semibold text-sm text-neutral-900">
                        Telegram
                      </div>
                      <div className="text-xs text-neutral-500">
                        Connected as @{telegramTag}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">
                  Notification Preferences
                </h2>
                <p className="text-sm text-neutral-500">
                  Choose what updates and alerts you want to receive.
                </p>
                <div className="divide-y divide-neutral-100">
                  <label className="flex items-center justify-between py-3 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-neutral-800">
                        Merchant Replies
                      </div>
                      <div className="text-xs text-neutral-500">
                        Get instant alerts when shops respond to your inquiries.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded accent-[#ea580c]"
                    />
                  </label>
                  <label className="flex items-center justify-between py-3 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-neutral-800">
                        Price Drops & Deals
                      </div>
                      <div className="text-xs text-neutral-500">
                        Notifications on saved products when prices change.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded accent-[#ea580c]"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">
                  Privacy & Security
                </h2>
                <p className="text-sm text-neutral-500">
                  Manage password, sessions, and authentication methods.
                </p>
                <div className="rounded-xl border border-neutral-200 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      Passwordless OTP Sign-in
                    </div>
                    <div className="text-xs text-neutral-500">
                      Enabled via verified email ({user.email || "Not set"})
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">
                    Active
                  </span>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">
                  Account Settings
                </h2>
                <p className="text-sm text-neutral-500">
                  Manage your account credentials and data.
                </p>
                <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                  <h3 className="text-sm font-semibold text-rose-800">
                    Danger Zone
                  </h3>
                  <p className="mt-1 text-xs text-rose-600">
                    Permanently delete your account and all associated inquiries.
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
