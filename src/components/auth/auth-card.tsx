import Link from "next/link";

/** The card heading and sub, shared by both modes and every step. */
export function AuthHeading({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2 className="text-[28px] font-extrabold tracking-[-0.03em] text-tn-ink">{title}</h2>
      <p className="mt-2 mb-6.5 text-[14.5px] leading-[1.5] text-tn-mute">{children}</p>
    </>
  );
}

/** "New to Tinsae? Create one free" / "Already have an account? Sign in". */
export function AuthSwitch({ mode }: { mode: "signin" | "signup" }) {
  const signup = mode === "signup";
  return (
    <p className="mt-6 text-center text-sm text-tn-mute">
      {signup ? "Already have an account? " : "New to Tinsae? "}
      <Link
        href={signup ? "/signin" : "/signup"}
        className="font-extrabold text-tn-red hover:underline"
      >
        {signup ? "Sign in" : "Create one free"}
      </Link>
    </p>
  );
}
