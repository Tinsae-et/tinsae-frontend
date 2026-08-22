// The three faces the design system uses, loaded once and shared by every root
// layout. Each route group has its own <html> (they are separate root layouts),
// so without this the font config gets copy-pasted per group and drifts.
import { JetBrains_Mono, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Carries the ትንሳኤ wordmark that appears in the logo, stat band and CTA.
const ethiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
});

/** Spread onto the <html> className of every root layout. */
export const fontVariables = `${jakarta.variable} ${jetbrains.variable} ${ethiopic.variable}`;
