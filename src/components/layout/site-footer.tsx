import Image from "next/image";
import Link from "next/link";

const COLUMNS: [string, string[]][] = [
  ["Buy", ["How it works", "Verified shops", "Trust & safety", "Browse all"]],
  ["Sell", ["List your shop", "Pricing", "Dashboard", "Telegram bot"]],
  ["Company", ["About", "Press", "Careers", "Contact", "Help"]],
  ["Legal", ["Terms & Privacy", "Returns"]],
];

export function SiteFooter() {
  return (
    <footer className="border-tn-hair mt-20 border-t">
      <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-8 px-6 py-14 sm:px-8 md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] lg:px-12 xl:px-16">
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <div className="mb-3.5">
            <Link href="/" className="inline-block">
              <Image
                src="/tinsae-logo.svg"
                alt="Tinsae"
                width={184}
                height={53}
                unoptimized
                className="h-9 w-auto"
              />
            </Link>
          </div>
          <p className="text-tn-mute max-w-xs text-sm leading-relaxed">
            The verified electronics marketplace for Addis Ababa. Compare,
            confirm, and buy in person.
          </p>
        </div>

        {COLUMNS.map(([title, items]) => (
          <div key={title}>
            <p className="text-tn-mute mb-3 text-[11px] font-bold tracking-[0.08em] uppercase">
              {title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={item}>
                  <Link
                    href={
                      item === "Browse all"
                        ? "/categories"
                        : item === "How it works"
                          ? "/how-it-works"
                          : item === "List your shop"
                            ? "/list-your-shop"
                            : item === "Pricing"
                              ? "/pricing"
                              : item === "Dashboard"
                                ? "/dashboard"
                                : item === "Telegram bot" || item === "Telegram Bot"
                                  ? "/telegram-bot"
                                  : item === "About"
                                    ? "/about"
                                    : item === "Press"
                                      ? "/press"
                                      : item === "Careers"
                                        ? "/careers"
                                        : item === "Contact"
                                          ? "/contact"
                                          : item === "Terms & Privacy"
                                            ? "/terms-and-privacy"
                                            : item === "Returns"
                                              ? "/returns"
                                              : item === "Verified shops"
                                                ? "/shops"
                                                : item === "Trust & safety"
                                                  ? "/trust-and-safety"
                                                  : item === "Help"
                                                    ? "/help"
                                                    : "#"
                    }
                    className="text-tn-ink2 hover:text-tn-red text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-tn-hair2 border-t px-6 py-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-tn-mute font-tn-mono mx-auto flex max-w-[1480px] flex-col gap-1.5 text-xs tracking-wide sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 TINSAE · ADDIS ABABA · ETHIOPIA</span>
          <span>ትንሳኤ · &ldquo;RISING&rdquo;</span>
        </div>
      </div>
    </footer>
  );
}
