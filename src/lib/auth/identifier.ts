// What a login identifier refers to.
//
// Mirrors `users.backends.resolve_user` on the backend, which routes by *shape*
// rather than trying each column in turn. The reason is worth restating,
// because it looks like needless indirection until it doesn't:
// `UnicodeUsernameValidator` permits `@`, so a username may legally look like
// an email address. Matching with `username = x OR email = x` would let anyone
// register the username `sara@shop.et` and make the real owner of that *email*
// ambiguous — whichever row came back first, the other account could never sign
// in again. That is account denial available to any visitor.
//
// One input shape, one column, no ambiguity. This copy exists so the mock
// driver behaves the same as Django; the real decision is always made server
// side, and the sign-in form posts the raw string either way.
import { nationalDigits } from "./phone";

export type IdentifierShape = "email" | "phone" | "username";

/**
 * Which column an identifier means.
 *
 * Order matters and matches the backend: `@` wins outright, then anything that
 * parses as an Ethiopian mobile, then username as the fallback.
 */
export function identifierShape(input: string): IdentifierShape {
  const value = input.trim();
  if (value.includes("@")) return "email";

  // Only digits and the separators people type between them can be a phone;
  // `bole9` must stay a username rather than becoming the number 9.
  if (/^[+\d\s\-().]+$/.test(value)) {
    const digits = nationalDigits(value);
    if (/^[79]\d{8}$/.test(digits)) return "phone";
  }

  return "username";
}
