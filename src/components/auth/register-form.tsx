"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthHeading, AuthSwitch } from "@/components/auth/auth-card";
import { Field, FormNotice, PhonePrefix, SubmitButton } from "@/components/auth/form";
import { AuthLegal } from "@/components/auth/legal";
import { RolePicker } from "@/components/auth/role-picker";
import { formatAsTyped, toE164, validatePhone } from "@/lib/auth/phone";
import { postAuth } from "@/lib/auth/submit";
import type { AuthUser, FieldErrors, Role } from "@/lib/auth/types";

/**
 * Registration form supporting both buyers and merchant accounts.
 */
export function RegisterForm({ next }: { next: string | null }) {
  const router = useRouter();

  const [role, setRole] = useState<Role>("buyer");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<React.ReactNode>();
  const [pending, setPending] = useState(false);

  function clearField(field: string) {
    setErrors((current) => {
      if (!(field in current)) return current;
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
  }

  function validate(): FieldErrors {
    const found: FieldErrors = {};

    if (username.trim()) {
      if (username.includes("@")) found.username = ["Use a name, not an email address."];
      else if (/^\+?\d[\d\s-]*$/.test(username.trim()))
        found.username = ["Use a name, not a phone number."];
    }

    if (!password) found.password = ["Choose a password."];
    else if (password.length < 8) found.password = ["Use at least 8 characters."];

    const phoneError = validatePhone(phone);
    if (phoneError) found.phone = [phoneError];

    if (role === "owner") {
      if (!shopName.trim()) found.shop_name = ["What is your shop called?"];
      if (!city.trim()) found.city = ["Which city are you in?"];
    }

    if (!email.trim()) {
      found.email = ["An email address is required."];
    } else if (!email.includes("@")) {
      found.email = ["That doesn't look like an email."];
    }

    return found;
  }

  async function register(event: React.FormEvent) {
    event.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setNotice(undefined);
    setPending(true);
    const result = await postAuth<{ user: AuthUser }>("/api/auth/register", {
      ...(fullName.trim() ? { full_name: fullName.trim() } : {}),
      ...(username.trim() ? { username: username.trim() } : {}),
      password,
      phone: toE164(phone),
      role,
      ...(role === "owner" ? { shop_name: shopName.trim(), city: city.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
    });
    setPending(false);

    if (result.ok) {
      if (next) {
        router.replace(next);
      } else if (role === "buyer") {
        router.replace("/");
      } else {
        router.replace("/shop/dashboard/overview");
      }
      router.refresh();
      return;
    }

    setErrors(result.fieldErrors);
    setNotice(Object.keys(result.fieldErrors).length > 0 ? undefined : result.detail);
  }

  return (
    <>
      {role === "owner" ? (
        <AuthHeading title="Open your shop">
          Register once, then list your stock and confirm it daily.
        </AuthHeading>
      ) : (
        <AuthHeading title="Create your account">
          Join free to save listings and message verified shops.
        </AuthHeading>
      )}

      {notice ? <FormNotice>{notice}</FormNotice> : null}

      <form onSubmit={register} noValidate className="space-y-4">
        <RolePicker value={role} onChange={setRole} disabled={pending} />

        <Field
          id="full_name"
          name="full_name"
          label="Full name"
          autoComplete="name"
          placeholder="Hanna Alemu"
          value={fullName}
          errors={errors.full_name}
          disabled={pending}
          onChange={(event) => {
            setFullName(event.target.value);
            clearField("full_name");
          }}
        />

        <Field
          id="username"
          name="username"
          label="Username (optional)"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={role === "owner" ? "bolephones" : "alex23"}
          value={username}
          errors={errors.username}
          disabled={pending}
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
          autoComplete="new-password"
          placeholder="••••••••"
          hint="At least 8 characters."
          value={password}
          errors={errors.password}
          disabled={pending}
          onChange={(event) => {
            setPassword(event.target.value);
            clearField("password");
          }}
        />

        <Field
          id="phone"
          name="phone"
          type="tel"
          label="Phone"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="91 234 5678"
          hint={role === "owner" ? "Buyers will call this number." : "Used to verify your account."}
          prefix={<PhonePrefix />}
          value={phone}
          errors={errors.phone}
          disabled={pending}
          onChange={(event) => {
            setPhone(formatAsTyped(event.target.value));
            clearField("phone");
          }}
        />

        {role === "owner" && (
          <>
            <Field
              id="shop_name"
              name="shop_name"
              label="Shop name"
              autoComplete="organization"
              placeholder="Bole Phones"
              value={shopName}
              errors={errors.shop_name}
              disabled={pending}
              onChange={(event) => {
                setShopName(event.target.value);
                clearField("shop_name");
              }}
            />

            <Field
              id="city"
              name="city"
              label="City"
              autoComplete="address-level2"
              placeholder="Addis Ababa"
              value={city}
              errors={errors.city}
              disabled={pending}
              onChange={(event) => {
                setCity(event.target.value);
                clearField("city");
              }}
            />
          </>
        )}

        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={role === "owner" ? "sales@yourshop.et" : "alex@gmail.com"}
          hint="Used for verification and sign-in."
          value={email}
          errors={errors.email}
          disabled={pending}
          onChange={(event) => {
            setEmail(event.target.value);
            clearField("email");
          }}
        />

        <div className="pt-1">
          <SubmitButton pending={pending} disabled={pending}>
            {role === "owner" ? "Create my shop" : "Create account"}
          </SubmitButton>
        </div>
      </form>

      <AuthSwitch mode="signup" />
      <AuthLegal />
    </>
  );
}
