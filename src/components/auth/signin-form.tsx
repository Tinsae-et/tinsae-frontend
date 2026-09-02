"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthHeading, AuthSwitch } from "@/components/auth/auth-card";
import { Field, FormNotice, SubmitButton } from "@/components/auth/form";
import { AuthLegal } from "@/components/auth/legal";
import { OrDivider, TelegramButton } from "@/components/auth/telegram-button";
import { homeFor } from "@/lib/auth/redirects";
import { postAuth } from "@/lib/auth/submit";
import { AuthErrorCode, type AuthUser, type FieldErrors } from "@/lib/auth/types";

/**
 * Sign-in: Telegram first, password second — where Telegram exists.
 *
 * No OTP here deliberately. A code proves you hold the SIM, which sign-in
 * doesn't need to re-establish — sign-up already verified the number, and the
 * session lasts. Sending an SMS on every sign-in would cost money and depend on
 * delivery for something the account itself can answer.
 *
 * `telegram` is off against the real backend because /auth/telegram/ is not
 * routed there yet (see docs/backend-requirements.md). A button that answers
 * 404 is worse than no button: it is the most prominent control on the page,
 * and a merchant who tries it concludes the product is broken rather than that
 * one path is unfinished. The whole flow stays intact behind the mock driver,
 * so nothing is deleted and turning it back on is one prop.
 */
export function SignInForm({
  next,
  telegram: telegramEnabled = false,
}: {
  next: string | null;
  telegram?: boolean;
}) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<React.ReactNode>();
  const [pending, setPending] = useState<"none" | "password" | "telegram">("none");

  function land(user: AuthUser) {
    router.replace(next ?? homeFor(user));
    router.refresh();
  }

  function clearField(field: string) {
    setErrors((current) => {
      if (!(field in current)) return current;
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault();

    const found: FieldErrors = {};
    if (!identifier.trim())
      found.identifier = ["Enter your username, email or phone."];
    if (!password) found.password = ["Enter your password."];
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setNotice(undefined);
    setPending("password");
    const result = await postAuth<{ user: AuthUser }>("/api/auth/login", {
      identifier,
      password,
    });
    setPending("none");

    if (result.ok) {
      land(result.data.user);
      return;
    }

    setErrors(result.fieldErrors);
    setNotice(
      result.code === AuthErrorCode.NoPassword
        ? result.detail
        : result.status === 401
          ? "Those details don't match an account."
          : // Login is throttled per account as well as per IP (5/min), so a
            // 429 here usually means this one account, not the whole service.
            result.status === 429
            ? "Too many sign-in attempts for that account. Wait a minute and try again."
            : result.detail,
    );
  }

  async function telegram() {
    setNotice(undefined);
    setPending("telegram");
    // Stand-in for the Login Widget's signed payload — see TelegramButton.
    const result = await postAuth<{ user: AuthUser }>("/api/auth/telegram", {
      payload: { id: "480215711", username: "tinsae_demo", first_name: "Demo" },
      mode: "signin",
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
      <AuthHeading title="Welcome back">
        Sign in to manage your products, prices and confirmations.
      </AuthHeading>

      {notice ? <FormNotice>{notice}</FormNotice> : null}

      {telegramEnabled ? (
        <>
          <TelegramButton
            onClick={telegram}
            pending={pending === "telegram"}
            disabled={pending !== "none"}
          />
          <OrDivider />
        </>
      ) : null}

      <form onSubmit={signIn} noValidate className="space-y-4">
        <Field
          id="identifier"
          name="identifier"
          label="Username, email or phone"
          // Correct for all three shapes: the spec defines "username" as the
          // account identifier, whatever form it takes, and password managers
          // pair it with current-password below.
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="bolephones"
          value={identifier}
          errors={errors.identifier}
          disabled={pending !== "none"}
          onChange={(event) => {
            setIdentifier(event.target.value);
            clearField("identifier");
          }}
        />

        <Field
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          errors={errors.password}
          disabled={pending !== "none"}
          onChange={(event) => {
            setPassword(event.target.value);
            clearField("password");
          }}
        />

        <div className="pt-1">
          <SubmitButton pending={pending === "password"} disabled={pending !== "none"}>
            Sign in
          </SubmitButton>
        </div>
      </form>

      <AuthSwitch mode="signin" />
      <AuthLegal />
    </>
  );
}
