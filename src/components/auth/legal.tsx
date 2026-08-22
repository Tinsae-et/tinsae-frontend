import Link from "next/link";

/** The terms line under both auth cards. */
export function AuthLegal() {
  return (
    <p className="mt-6.5 text-center text-[11.5px] leading-[1.6] text-tn-mute">
      By continuing you agree to Tinsae&apos;s{" "}
      {/* TODO: point at the real legal pages when they exist (no route yet). */}
      <Link href="/legal/terms" className="font-semibold text-tn-ink2 underline">
        Terms
      </Link>{" "}
      &amp;{" "}
      <Link href="/legal/privacy" className="font-semibold text-tn-ink2 underline">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
