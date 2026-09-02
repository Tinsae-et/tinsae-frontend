// Eyebrow + SectionHead for the Trust & Safety page, matching the pattern used
// on How It Works: a 13px uppercase eyebrow, an 800-weight h2, then an
// optional 17px intro. The 38px heads that sit inside a panel or a two-column
// band are written inline in their own sections — they carry their own colour
// and measure.

export function Eyebrow({
  children,
  color = "text-tn-red",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className={`mb-3.5 text-[13px] font-bold tracking-[0.11em] uppercase ${color}`}>
      {children}
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-tn-ink text-[32px] leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-[42px]">
        {title}
      </h2>
      {intro && (
        <p
          className={`text-tn-mute mt-4 text-base leading-[1.55] font-medium sm:text-[17px] ${
            center ? "mx-auto max-w-[640px]" : "max-w-[580px]"
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
