// The tagline lockup from public/assets/logo/tinsae-logo-tagline{,-dark}.svg,
// inlined rather than referenced as a file.
//
// Two reasons it isn't an <img>: an SVG loaded through <img> renders in its own
// document and cannot see the page's webfonts, so the wordmark would silently
// fall back to Arial; and the file names its faces literally ("Plus Jakarta
// Sans"), while next/font serves them under generated family names reachable
// only through the CSS variables. Inline, both problems go away.
//
// Geometry, sizes and letter-spacing are copied from the SVGs unchanged.

type Tone = "ink" | "onDark";

const TONES: Record<Tone, { mark: string; word: string; tagline: string }> = {
  // Transparent ground: red mark, ink wordmark, red tagline.
  ink: { mark: "#CC3000", word: "#0B0B0B", tagline: "#CC3000" },
  // On an ink ground. The source file carries its own #0B0B0B rounded rect;
  // it is dropped here because the panel already supplies that ground, and the
  // rect would show as a dark rectangle wherever the red glow sits behind it.
  onDark: { mark: "#FFFFFF", word: "#FFFFFF", tagline: "rgba(255,255,255,0.72)" },
};

export function TinsaeLogo({
  tone = "ink",
  className,
  title = "Tinsae — verified shops",
}: {
  tone?: Tone;
  className?: string;
  title?: string;
}) {
  const colors = TONES[tone];

  return (
    <svg
      viewBox="0 0 286 120"
      role="img"
      aria-label={title}
      className={className}
    >
      <g
        transform="translate(32 37) scale(0.71875)"
        fill="none"
        stroke={colors.mark}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 39 L22 49 L57 9" />
        <path d="M42 9 H57 V24" />
      </g>

      <text
        x="94"
        y="65"
        fill={colors.word}
        fontSize="38"
        fontWeight="800"
        letterSpacing="-1.33"
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        Tinsae
      </text>

      {/* Ethiopic face for ትንሳኤ, per the asset README's strict font roles. */}
      <text
        x="94"
        y="83"
        fill={colors.tagline}
        fontSize="15"
        fontWeight="600"
        letterSpacing="0.3"
        style={{ fontFamily: "var(--font-ethiopic), sans-serif" }}
      >
        ትንሳኤ · verified shops
      </text>
    </svg>
  );
}
