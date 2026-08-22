"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { cn } from "@/lib/utils";

const STEPS = ["Find your shop", "Shop details", "Get verified", "Done"];
const AREAS = ["Atlas", "Friendship", "Olympia", "Japan", "Medhanialem", "Rwanda", "Bulgaria"];
const CATS = ["Phones", "Laptops", "Audio", "Tablets", "Accessories", "Cameras"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = [
  "8:00 am",
  "8:30 am",
  "9:00 am",
  "9:30 am",
  "10:00 am",
  "11:00 am",
  "12:00 pm",
  "1:00 pm",
  "6:00 pm",
  "7:00 pm",
  "8:00 pm",
  "9:00 pm",
];

const CANDIDATES = [
  {
    id: "al",
    name: "Almeda Electronics",
    hood: "Bole · Atlas",
    note: "Listed by a buyer · 142 products seen",
    color: "#0F2A4D",
  },
  {
    id: "al2",
    name: "Almeda Mobile & Accessories",
    hood: "Bole · Friendship",
    note: "Imported from directory · unclaimed",
    color: "#3B5742",
  },
];

function SidePanel({ step }: { step: number }) {
  return (
    <aside className="bg-tn-ink sticky top-0 hidden h-screen w-[380px] shrink-0 flex-col p-[34px_36px] text-white lg:flex">
      <Link href="/" className="flex items-baseline gap-2.5">
        <span className="font-tn-amh text-[22px] font-bold text-[#FF7A4D]">ትንሳኤ</span>
        <span className="text-xl font-extrabold tracking-[-0.03em] text-white">Tinsae</span>
        <span className="ml-1 rounded-full bg-white/12 px-2 py-0.5 text-[9.5px] font-bold tracking-wider text-white/80">
          FOR SHOPS
        </span>
      </Link>

      <h2 className="mt-10 text-[30px] leading-[1.12] font-extrabold tracking-[-0.03em]">
        List your shop on Tinsae
      </h2>
      <p className="mt-3.5 text-[14.5px] leading-relaxed text-white/60">
        Get verified, reach buyers across Bole, and keep your stock current with a daily Telegram
        check-in.
      </p>

      {/* Stepper */}
      <div className="mt-10 flex flex-col gap-1">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <div key={s} className="flex items-center gap-3.5 py-2.5">
              <span
                className={cn(
                  "font-tn-mono inline-flex size-7.5 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold",
                  state === "active" && "bg-white text-tn-ink",
                  state === "done" && "bg-tn-green text-white",
                  state === "todo" && "border border-white/15 bg-white/10 text-white/40",
                )}
              >
                {state === "done" ? <Icon name="check" size={15} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[14.5px]",
                  state === "active" && "font-extrabold text-white",
                  state === "done" && "font-semibold text-white",
                  state === "todo" && "font-semibold text-white/45",
                )}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Proof */}
      <div className="mt-auto rounded-2xl bg-white/6 p-4">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {["#0F2A4D", "#3B5742", "#7A2E2E", "#2D4A5E"].map((c, i) => (
              <span
                key={i}
                style={{ background: c }}
                className="border-tn-ink inline-flex size-7.5 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white"
              >
                {["AE", "MT", "KF", "AX"][i]}
              </span>
            ))}
          </div>
          <span className="ml-3 text-[13px] font-semibold text-white/85">
            412 verified shops in Bole
          </span>
        </div>
      </div>
    </aside>
  );
}

export default function ShopOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [claim, setClaim] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set(["Phones"]));
  const [area, setArea] = useState("Atlas");
  const [phone, setPhone] = useState("+251 91 234 5678");
  const [address, setAddress] = useState("");
  const [days, setDays] = useState<Set<string>>(
    new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
  );
  const [openTime, setOpenTime] = useState("9:00 am");
  const [closeTime, setCloseTime] = useState("8:00 pm");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Owner");
  const [docs, setDocs] = useState({ id: false, biz: false });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };

  const pickCandidate = (id: string) => {
    setClaim(id);
    if (id !== "new") {
      const c = CANDIDATES.find((x) => x.id === id);
      setName(c ? c.name : "");
    } else {
      setName("");
    }
  };

  const canNext =
    step === 0
      ? !!claim
      : step === 1
        ? !!(name.trim() && area && cats.size > 0)
        : step === 2
          ? consent
          : true;

  async function handleNext() {
    if (!canNext) return;

    if (step === 2) {
      // Submit shop creation
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/shop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            city: `Bole · ${area}`,
            phone: phone.trim(),
            description: `${Array.from(cats).join(", ")} in ${area}, Bole.`,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || "Failed to create shop.");
        }
        setStep(3);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error creating shop.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="bg-tn-paper text-tn-ink flex min-h-screen">
      <SidePanel step={step} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="border-b-tn-hair2 sticky top-0 z-10 flex h-[70px] items-center justify-between border-b bg-white/90 px-6 backdrop-blur-md lg:px-10">
          <span className="font-tn-mono text-tn-mute text-[13px] font-semibold">
            Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
          </span>

          <div className="flex items-center gap-4 text-[13.5px] font-bold">
            <Link href="/" className="text-tn-ink2 hover:text-tn-ink">
              Back to site
            </Link>
            <Link href="/dashboard" className="text-tn-red hover:text-tn-red-dark">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-tn-hair2 h-1">
          <div
            className="bg-tn-red h-full transition-[width] duration-300 ease-out"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Form area */}
        <div className="flex flex-1 justify-center overflow-y-auto px-6 py-10 pb-16 lg:px-10">
          <div className="w-full max-w-[560px]">
            {error && (
              <div className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mb-6 rounded-xl border p-3.5 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* ── STEP 0: Find your shop ──────────────────────── */}
            {step === 0 && (
              <div>
                <h1 className="text-[32px] leading-tight font-extrabold tracking-[-0.03em]">
                  Find your shop
                </h1>
                <p className="text-tn-mute mt-3 mb-7 text-[15.5px] leading-relaxed">
                  Your shop may already be on Tinsae. Search to claim it — or create a new one.
                </p>

                <div className="mb-4">
                  <label className="text-tn-ink mb-2 block text-[13px] font-bold">
                    Shop name or phone number
                  </label>
                  <input
                    type="text"
                    defaultValue="Almeda"
                    placeholder="e.g. Almeda Electronics · +251 91 …"
                    className="border-tn-hair text-tn-ink placeholder:text-tn-mute h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2"
                  />
                </div>

                <div className="text-tn-mute mt-4 mb-3 text-[12.5px] font-bold tracking-wider uppercase">
                  2 possible matches
                </div>

                <div className="flex flex-col gap-2.5">
                  {CANDIDATES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => pickCandidate(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all",
                        claim === c.id
                          ? "border-tn-red shadow-[0_0_0_3px_rgba(204,48,0,0.08)] bg-white"
                          : "border-tn-hair hover:border-tn-mute/40 bg-white",
                      )}
                    >
                      <span
                        style={{ background: c.color }}
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
                      >
                        {c.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-tn-ink font-extrabold text-[15px]">{c.name}</span>
                          <span className="bg-tn-warn/15 text-tn-warn inline-flex rounded-md px-2 py-0.5 text-[10.5px] font-bold">
                            Unclaimed
                          </span>
                        </div>
                        <span className="text-tn-mute mt-0.5 block text-[12.5px]">
                          {c.hood} · {c.note}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "flex size-5.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          claim === c.id ? "bg-tn-red border-tn-red text-white" : "border-tn-hair bg-white",
                        )}
                      >
                        {claim === c.id && <Icon name="check" size={12} strokeWidth={3} />}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => pickCandidate("new")}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all",
                      claim === "new"
                        ? "border-tn-red bg-tn-red-soft/40 shadow-[0_0_0_3px_rgba(204,48,0,0.08)]"
                        : "border-tn-hair hover:border-tn-mute/40 bg-white",
                    )}
                  >
                    <span className="bg-tn-paper text-tn-red inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
                      <Icon name="plus" size={20} strokeWidth={2.4} />
                    </span>
                    <div className="flex-1">
                      <span className="text-tn-ink block text-[15px] font-extrabold">
                        None of these — create a new shop
                      </span>
                      <span className="text-tn-mute mt-0.5 block text-[12.5px]">
                        Start fresh and add your details
                      </span>
                    </div>
                    <span
                      className={cn(
                        "flex size-5.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        claim === "new" ? "bg-tn-red border-tn-red text-white" : "border-tn-hair bg-white",
                      )}
                    >
                      {claim === "new" && <Icon name="check" size={12} strokeWidth={3} />}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 1: Shop details ────────────────────────── */}
            {step === 1 && (
              <div>
                <h1 className="text-[32px] leading-tight font-extrabold tracking-[-0.03em]">
                  Shop details
                </h1>
                <p className="text-tn-mute mt-3 mb-7 text-[15.5px] leading-relaxed">
                  Buyers see this on your storefront and listings.
                </p>

                <div className="space-y-4.5">
                  <div>
                    <label className="text-tn-ink mb-2 block text-[13px] font-bold">Shop name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bole Electronics Hub"
                      className="border-tn-hair text-tn-ink placeholder:text-tn-mute h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-tn-ink text-[13px] font-bold">Categories you sell</label>
                      <span className="text-tn-mute text-xs font-semibold">{cats.size} selected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATS.map((c) => {
                        const on = cats.has(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggle(cats, setCats, c)}
                            className={cn(
                              "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] font-bold transition-colors",
                              on
                                ? "bg-tn-ink text-white border-tn-ink"
                                : "border-tn-hair bg-white text-tn-ink2 hover:border-tn-mute",
                            )}
                          >
                            {c}
                            {on && <Icon name="check" size={13} strokeWidth={2.4} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="text-tn-ink mb-2 block text-[13px] font-bold">
                        Area in Bole
                      </label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="border-tn-hair text-tn-ink h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2"
                      >
                        {AREAS.map((a) => (
                          <option key={a} value={a}>
                            Bole · {a}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-tn-ink mb-2 block text-[13px] font-bold">
                        Phone (buyers contact)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 91 234 5678"
                        className="font-tn-mono border-tn-hair text-tn-ink placeholder:text-tn-mute h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-tn-ink mb-2 block text-[13px] font-bold">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Building, street, landmark (e.g. Edna Mall 2nd Floor)"
                      className="border-tn-hair text-tn-ink placeholder:text-tn-mute h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2"
                    />
                  </div>

                  <div>
                    <label className="text-tn-ink mb-2 block text-[13px] font-bold">
                      Pin location on map
                    </label>
                    <div className="border-tn-hair flex h-28 items-center justify-center gap-2 rounded-2xl border bg-[repeating-linear-gradient(45deg,#F7F6F2,#F7F6F2_11px,#FFFFFF_11px,#FFFFFF_22px)] text-sm font-bold text-tn-ink2 shadow-inner">
                      <Icon name="pin" size={20} className="text-tn-red" />
                      Drop your pin on the map
                    </div>
                  </div>

                  <div>
                    <label className="text-tn-ink mb-2 block text-[13px] font-bold">Opening hours</label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {DAYS.map((d) => {
                        const on = days.has(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggle(days, setDays, d)}
                            className={cn(
                              "size-10 rounded-xl border text-[13px] font-bold transition-colors",
                              on
                                ? "bg-tn-ink text-white border-tn-ink"
                                : "border-tn-hair bg-white text-tn-mute hover:border-tn-mute",
                            )}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="border-tn-hair text-tn-ink h-11 flex-1 rounded-xl border bg-white px-3 text-[14px] outline-none"
                      >
                        {TIMES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="text-tn-mute text-sm font-semibold">to</span>
                      <select
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="border-tn-hair text-tn-ink h-11 flex-1 rounded-xl border bg-white px-3 text-[14px] outline-none"
                      >
                        {TIMES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Get verified ────────────────────────── */}
            {step === 2 && (
              <div>
                <h1 className="text-[32px] leading-tight font-extrabold tracking-[-0.03em]">
                  Get verified
                </h1>
                <p className="text-tn-mute mt-3 mb-7 text-[15.5px] leading-relaxed">
                  Verification is the trust spine of Tinsae — buyers filter for it. It usually takes
                  under 24 hours, and you can start listing right away.
                </p>

                <div className="space-y-4.5">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="text-tn-ink mb-2 block text-[13px] font-bold">
                        Your full name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Owner / Manager name"
                        className="border-tn-hair text-tn-ink placeholder:text-tn-mute h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2"
                      />
                    </div>

                    <div>
                      <label className="text-tn-ink mb-2 block text-[13px] font-bold">Your role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border-tn-hair text-tn-ink h-12 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-tn-ink2"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Manager">Manager</option>
                        <option value="Authorized staff">Authorized staff</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-tn-ink text-[13px] font-bold">Owner ID</label>
                      <span className="text-tn-mute text-xs font-semibold">National ID or Passport</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocs((d) => ({ ...d, id: !d.id }))}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-2xl border-2 border-dashed p-4 text-left transition-all",
                        docs.id
                          ? "border-tn-green bg-tn-green-soft"
                          : "border-tn-hair bg-tn-paper hover:border-tn-mute/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
                          docs.id ? "text-tn-green" : "text-tn-mute",
                        )}
                      >
                        <Icon name={docs.id ? "check" : "shield"} size={20} />
                      </span>
                      <div className="flex-1">
                        <span className="text-tn-ink block text-[14.5px] font-extrabold">
                          {docs.id ? "Uploaded · National ID" : "National ID / Passport"}
                        </span>
                        <span className="text-tn-mute mt-0.5 block text-xs">
                          {docs.id ? "Tap to replace" : "JPG or PDF · up to 10 MB"}
                        </span>
                      </div>
                      {docs.id && (
                        <span className="bg-tn-green/20 text-tn-green rounded-md px-2 py-0.5 text-xs font-bold">
                          Ready
                        </span>
                      )}
                    </button>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-tn-ink text-[13px] font-bold">Business licence</label>
                      <span className="text-tn-mute text-xs font-semibold">Optional · Speeds review</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocs((d) => ({ ...d, biz: !d.biz }))}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-2xl border-2 border-dashed p-4 text-left transition-all",
                        docs.biz
                          ? "border-tn-green bg-tn-green-soft"
                          : "border-tn-hair bg-tn-paper hover:border-tn-mute/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
                          docs.biz ? "text-tn-green" : "text-tn-mute",
                        )}
                      >
                        <Icon name={docs.biz ? "check" : "building"} size={20} />
                      </span>
                      <div className="flex-1">
                        <span className="text-tn-ink block text-[14.5px] font-extrabold">
                          {docs.biz ? "Uploaded · Trade licence" : "Trade licence document"}
                        </span>
                        <span className="text-tn-mute mt-0.5 block text-xs">
                          {docs.biz ? "Tap to replace" : "JPG or PDF · up to 10 MB"}
                        </span>
                      </div>
                      {docs.biz && (
                        <span className="bg-tn-green/20 text-tn-green rounded-md px-2 py-0.5 text-xs font-bold">
                          Ready
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Consent Checkbox */}
                  <button
                    type="button"
                    onClick={() => setConsent((c) => !c)}
                    className={cn(
                      "mt-3 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                      consent
                        ? "border-tn-green/40 bg-tn-green-soft"
                        : "border-tn-hair bg-white hover:border-tn-mute/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                        consent ? "bg-tn-green border-tn-green text-white" : "border-tn-hair bg-white",
                      )}
                    >
                      {consent && <Icon name="check" size={12} strokeWidth={3} />}
                    </span>
                    <span className="text-tn-ink2 text-[13.5px] leading-relaxed">
                      I confirm I&apos;m authorized to represent this shop, and that the details
                      provided are accurate.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Done & Telegram Handoff ──────────────── */}
            {step === 3 && (
              <div className="py-6 text-center">
                <div className="bg-tn-green-soft inline-flex size-20 items-center justify-center rounded-full">
                  <span className="bg-tn-green flex size-14 items-center justify-center rounded-full text-white">
                    <Icon name="check" size={30} strokeWidth={3} />
                  </span>
                </div>

                <h1 className="text-tn-ink mt-6 text-[32px] font-extrabold tracking-tight">
                  {name || "Your shop"} is registered!
                </h1>
                <p className="text-tn-mute mx-auto mt-3 max-w-[440px] text-[15.5px] leading-relaxed">
                  Verification is under review — you&apos;ll get a confirmation message within 24
                  hours. Meanwhile, set up the bot so your stock stays current.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <span className="bg-tn-warn/15 text-tn-warn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
                    <Icon name="clock" size={12} />
                    Verification pending
                  </span>
                  {Array.from(cats)
                    .slice(0, 3)
                    .map((c) => (
                      <span
                        key={c}
                        className="bg-tn-paper text-tn-ink2 rounded-full px-3 py-1 text-xs font-bold"
                      >
                        {c}
                      </span>
                    ))}
                  {area && (
                    <span className="bg-tn-paper text-tn-ink2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
                      <Icon name="pin" size={11} />
                      Bole · {area}
                    </span>
                  )}
                </div>

                {/* Telegram Card */}
                <div className="bg-tn-ink mt-8 rounded-3xl p-6 text-left text-white shadow-xl sm:p-7">
                  <div className="flex items-center gap-3.5">
                    <span className="bg-tn-telegram flex size-12 shrink-0 items-center justify-center rounded-2xl text-white">
                      <Icon name="tg" size={24} />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-white">Connect your Telegram bot</h3>
                      <p className="text-[13px] text-white/65">
                        Confirm stock in one tap each morning so buyers only ever see what&apos;s
                        available.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Pill
                      kind="light"
                      size="md"
                      iconAfter="arrow"
                      onClick={() => router.push("/dashboard")}
                    >
                      Go to dashboard
                    </Pill>
                    <Pill
                      kind="ghost"
                      size="md"
                      icon="tg"
                      href="https://t.me/TinsaeStockBot"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Open @TinsaeStockBot
                    </Pill>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        {step < 3 && (
          <div className="border-t-tn-hair2 sticky bottom-0 z-10 flex items-center justify-between border-t bg-white px-6 py-4.5 lg:px-10">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className={cn(
                "inline-flex items-center gap-1.5 text-[14.5px] font-bold transition-colors",
                step === 0 ? "text-tn-mute/40 cursor-not-allowed" : "text-tn-ink2 hover:text-tn-red",
              )}
            >
              <Icon name="arrow" size={15} className="rotate-180" />
              Back
            </button>

            <Pill
              kind={canNext ? "solid" : "outline"}
              size="md"
              iconAfter="arrow"
              onClick={handleNext}
              className={!canNext ? "cursor-not-allowed opacity-50 shadow-none" : ""}
            >
              {submitting ? "Creating shop…" : step === 2 ? "Create my shop" : "Continue"}
            </Pill>
          </div>
        )}
      </div>
    </div>
  );
}
