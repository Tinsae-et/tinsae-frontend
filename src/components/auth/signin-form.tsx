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
 * Sign-in: Telegram first, password second.
 *
 * No OTP here deliberately. A code proves you hold the SIM, which sign-in
 * doesn't need to re-establish — sign-up already verified the number, and the
 * session lasts. Sending an SMS on every sign-in would cost money and depend on
 * delivery for something the account itself can answer.
 */
export function SignInForm({ next }: { next: string | null }) {
  const router = useRouter();

  const [username, setUsername] = useState("");
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
    if (!username.trim()) found.username = ["Enter your username."];
    if (!password) found.password = ["Enter your password."];
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setNotice(undefined);
    setPending("password");
    const result = await postAuth<{ user: AuthUser }>("/api/auth/login", {
      username,
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
          ? "That username and password don't match an account."
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

      <TelegramButton
        onClick={telegram}
        pending={pending === "telegram"}
        disabled={pending !== "none"}
      />

      <OrDivider />

      <form onSubmit={signIn} noValidate className="space-y-4">
        <Field
          id="username"
          name="username"
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="bolephones"
          value={username}
          errors={errors.username}
          disabled={pending !== "none"}
          onChange={(event) => {
            setUsername(event.target.value);
            clearField("username");
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
