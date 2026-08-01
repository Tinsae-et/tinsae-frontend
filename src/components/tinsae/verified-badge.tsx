// Ported from window.TINSAE.VerifiedBadge — a filled green disc with a check.

export function VerifiedBadge({ size = 14, title = "Verified shop" }: { size?: number; title?: string }) {
  return (
    <span
      title={title}
      className="bg-tn-verified inline-flex shrink-0 items-center justify-center rounded-full text-white"
      style={{ width: size + 4, height: size + 4 }}
    >
      <span className="sr-only">{title}</span>
      <svg
        width={size - 2}
        height={size - 2}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
    </span>
  );
}
