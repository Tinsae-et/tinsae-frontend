// Ethiopian mobile numbers, one canonical form.
//
// Only +251 is supported (the handoff: "Add a country picker only if you
// expand beyond Ethiopia"), so the country code is a fixed prefix and the user
// only ever types the 9 national digits.

export const COUNTRY_CODE = "+251";

/**
 * The 9 national digits, from any form the number arrives in.
 *
 * Accepts "91 234 5678", "0912345678" and "+251912345678" alike, which keeps
 * `toE164` idempotent — the value crosses the client/route boundary already
 * normalised, and normalising it twice must not prepend a second 251.
 * No collision to worry about: Ethiopian mobile numbers open with 9 or 7.
 */
export function nationalDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("251")) digits = digits.slice(3);
  // People often type the trunk prefix out of habit; 0912… and 912… are the
  // same number, so drop the leading zero rather than calling it invalid.
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/** Canonical wire format: +251912345678. */
export function toE164(input: string): string {
  return `${COUNTRY_CODE}${nationalDigits(input)}`;
}

/** Display format, matching the design's "+251 91 234 5678". */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "").slice(-9);
  if (digits.length !== 9) return e164;
  return `${COUNTRY_CODE} ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

/** Groups the national part as the user types: "912345678" -> "91 234 5678". */
export function formatAsTyped(input: string): string {
  const digits = nationalDigits(input).slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)];
  return parts.filter(Boolean).join(" ");
}

/**
 * Ethiopian mobile numbers are 9 national digits opening with 9 (Ethio
 * Telecom) or 7 (Safaricom Ethiopia). Anything else is a typo or a landline,
 * and an SMS to it silently goes nowhere.
 */
export function validatePhone(input: string): string | null {
  const digits = nationalDigits(input);
  if (digits.length === 0) return "Enter your phone number.";
  if (digits.length !== 9) return "That's not 9 digits — check the number.";
  if (!/^[97]/.test(digits)) return "Ethiopian mobile numbers start with 9 or 7.";
  return null;
}
