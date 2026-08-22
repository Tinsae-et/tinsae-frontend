"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthHeading, AuthSwitch } from "@/components/auth/auth-card";
import { Field, FormNotice, PhonePrefix, SubmitButton } from "@/components/auth/form";
import { AuthLegal } from "@/components/auth/legal";
import { OtpInput } from "@/components/auth/otp-input";
import { RolePicker } from "@/components/auth/role-picker";
import { OrDivider, TelegramButton } from "@/components/auth/telegram-button";
import { Icon } from "@/components/tinsae/icon";
import { formatAsTyped, formatPhone, toE164, validatePhone } from "@/lib/auth/phone";
import { homeFor } from "@/lib/auth/redirects";
import { postAuth } from "@/lib/auth/submit";
import { AuthErrorCode, type AuthUser, type Role } from "@/lib/auth/types";

type Step = "start" | "otp";

/**
 * Sign-up: role → Telegram or phone → six digits.
 *
 * The OTP lives here and only here. Verifying the number at registration is
 * worth an SMS — it's the number buyers will dial, and an unreachable one is a
 * dead listing. Sign-in has nothing left to prove, so it doesn't send one.
 */
export function SignUpFlow({ next }: { next: string | null }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("start");
  const [role, setRole] = useState<Role>("buyer");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [phoneError, setPhoneError] = useState<string>();
  const [notice, setNotice] = useState<React.ReactNode>();
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [pending, setPending] = useState<"none" | "otp" | "verify" | "telegram">("none");

  const [resendAt, setResendAt] = useState<number | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string>();

  // The design's "Resend in 0:28" is static in the prototype. Make it real.
  //
  // Counted down from a deadline rather than by decrementing a number: browsers
  // throttle timers in background tabs to about once a minute, so a
  // tick-per-second counter falls behind wall-clock and would still be showing
  // a cooldown the server stopped enforcing a while ago.
  useEffect(() => {
    if (resendAt === null) return;
    const tick = () => setResendIn(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  function land(user: AuthUser) {
    router.replace(next ?? homeFor(user.role));
    router.refresh();
  }

  async function sendCode(resend = false) {
    const problem = validatePhone(phone);
    if (problem) {
      setPhoneError(problem);
      return;
    }

    setNotice(undefined);
    setPhoneError(undefined);
    setPending("otp");
    const result = await postAuth<{ resend_in: number; dev_code?: string }>(
      "/api/auth/otp/request",
      { phone: toE164(phone), mode: "signup" },
    );
    setPending("none");

    if (!result.ok) {
      if (result.fieldErrors.phone) setPhoneError(result.fieldErrors.phone[0]);
      else setNotice(result.detail);
      return;
    }

    if (!resend) setStep("otp");
    setCode("");
    setCodeInvalid(false);
    setResendAt(Date.now() + result.data.resend_in * 1000);
    setDevCode(result.data.dev_code);
  }

  async function verify() {
    setNotice(undefined);
    setPending("verify");
    const result = await postAuth<{ user: AuthUser }>("/api/auth/otp/verify", {
      phone: toE164(phone),
      code,
      mode: "signup",
      role,
    });
    setPending("none");

    if (result.ok) {
      land(result.data.user);
      return;
    }

    setCodeInvalid(true);
    setNotice(result.detail);
    // A dead code is worth another round trip, so let them ask immediately
    // instead of watching a countdown for a code that can never work.
    if (result.code === AuthErrorCode.ExpiredCode) {
      setResendAt(null);
      setResendIn(0);
    }
    if (result.code === AuthErrorCode.BadCode) setCode("");
  }

  async function telegram() {
    setNotice(undefined);
    setPending("telegram");
    // Stand-in for the Login Widget's signed payload — see TelegramButton.
    const result = await postAuth<{ user: AuthUser }>("/api/auth/telegram", {
      payload: { id: "480215711", username: "tinsae_demo", first_name: "Demo" },
      mode: "signup",
      role,
    });
    setPending("none");

    if (result.ok) {
      land(result.data.user);
      return;
    }
    setNotice(result.detail);
  }

  return (
    <>
      {step === "otp" ? (
        <AuthHeading title="Enter the code">
          We sent a 6-digit code to{" "}
          <b className="font-bold text-tn-ink2">{formatPhone(toE164(phone))}</b> via SMS.
        </AuthHeading>
      ) : (
        <AuthHeading title="Create your account">
          Join free to save listings and message verified shops.
        </AuthHeading>
      )}

      {notice ? <FormNotice>{notice}</FormNotice> : null}

      {step === "start" ? (
        <>
          <RolePicker value={role} onChange={setRole} disabled={pending !== "none"} />

          <TelegramButton
            onClick={telegram}
            pending={pending === "telegram"}
            disabled={pending !== "none"}
          />

          <OrDivider />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendCode();
            }}
            noValidate
          >
            <Field
              id="phone"
              name="phone"
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="91 234 5678"
              className="font-tn-mono"
              prefix={<PhonePrefix />}
              value={phone}
              errors={phoneError ? [phoneError] : undefined}
              disabled={pending !== "none"}
              onChange={(event) => {
                setPhone(formatAsTyped(event.target.value));
                setPhoneError(undefined);
              }}
            />

            <div className="mt-3.5">
              <SubmitButton pending={pending === "otp"}>Send code</SubmitButton>
            </div>
          </form>
        </>
      ) : (
        <>
          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next);
              setCodeInvalid(false);
            }}
            invalid={codeInvalid}
            disabled={pending === "verify"}
            autoFocus
          />

          {devCode ? (
            <p className="mt-3 rounded-[11px] border border-tn-warn/30 bg-tn-warn/8 px-3.5 py-2 text-[12px] text-tn-warn">
              Mock driver — no SMS was sent. The code is{" "}
              <b className="font-tn-mono font-bold">{devCode}</b>.
            </p>
          ) : null}

          <div className="mt-5.5">
            <SubmitButton
              type="button"
              pending={pending === "verify"}
              disabled={code.length < 6}
              onClick={() => void verify()}
            >
              Create account
            </SubmitButton>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStep("start");
                setCode("");
                setCodeInvalid(false);
                setNotice(undefined);
                setDevCode(undefined);
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-tn-ink2 hover:text-tn-red"
            >
              <Icon name="arrow" size={14} className="rotate-180" />
              Change number
            </button>

            {resendIn > 0 ? (
              <span className="text-[13px] text-tn-mute">
                Resend in <b className="font-tn-mono font-bold text-tn-ink2">{clock(resendIn)}</b>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void sendCode(true)}
                disabled={pending !== "none"}
                className="text-[13px] font-bold text-tn-red hover:underline disabled:opacity-60"
              >
                {pending === "otp" ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>
        </>
      )}

      {step !== "otp" ? <AuthSwitch mode="signup" /> : null}

      <AuthLegal />
    </>
  );
}

/** 88 -> "1:28". */
function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
