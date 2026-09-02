import { Icon, type IconName } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";

// The three things we actually check before a shop can carry the badge. The
// right-hand icon is the muted evidence marker from the design, not an action.
const verificationChecks: [IconName, string][] = [
  ["phone", "Phone & owner identity"],
  ["spec", "Business registration"],
  ["building", "In-person store visit"],
];

export function TrustHero() {
  return (
    <section className="border-tn-hair2 relative overflow-hidden border-b bg-[radial-gradient(120%_90%_at_86%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_52%)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-6 pt-14 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-7 lg:pt-[76px] lg:pb-16">
        <div>
          <div className="border-tn-hair text-tn-ink2 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-[7px] text-[13px] font-bold whitespace-nowrap shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
            <Icon name="shield" size={15} className="text-tn-red" />
            Trust &amp; safety
          </div>

          <h1 className="text-tn-ink mt-[22px] text-[40px] leading-[1.0] font-extrabold tracking-[-0.04em] sm:text-[54px] lg:text-[62px]">
            What <span className="text-tn-red">&ldquo;verified&rdquo;</span>
            <br />
            actually means.
          </h1>

          <p className="text-tn-mute mt-6 max-w-[500px] text-base leading-[1.55] font-medium sm:text-[18.5px]">
            The badge isn&rsquo;t decoration. Every Tinsae shop passes a real, three-part check, every
            listing is re-confirmed in stock, and you always buy in person. Here&rsquo;s exactly how it
            works &mdash; and how to stay safe.
          </p>

          <div className="mt-[30px] flex flex-wrap gap-3">
            <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">
              Browse verified shops
            </Pill>
            <Pill kind="outline" size="lg" href="/how-it-works">
              How Tinsae works
            </Pill>
          </div>
        </div>

        <div className="w-full lg:justify-self-end">
          <BadgeCard />
        </div>
      </div>
    </section>
  );
}

// The anatomy of the badge, rendered as the object it describes. Reusable
// anywhere the verified badge needs explaining (tooltip, modal, shop profile).
function BadgeCard() {
  return (
    <div className="border-tn-hair mx-auto w-full max-w-[420px] overflow-hidden rounded-[22px] border bg-white shadow-[0_30px_70px_rgba(11,11,11,0.13)] lg:mr-0">
      <div className="relative h-[70px] bg-[linear-gradient(120deg,#0F2A4D_0%,#1d4068_100%)]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.16] [background:repeating-linear-gradient(45deg,transparent,transparent_9px,rgba(255,255,255,0.4)_9px,rgba(255,255,255,0.4)_10px)]"
        />
      </div>

      <div className="relative -mt-[26px] px-6 pb-6">
        <div className="flex size-14 items-center justify-center rounded-[15px] border-[3px] border-white bg-[#0F2A4D] text-[19px] font-extrabold text-white shadow-[0_6px_16px_rgba(11,11,11,0.14)]">
          AE
        </div>

        <div className="mt-3.5 flex items-center gap-[7px]">
          <span className="text-tn-ink text-[19px] font-extrabold tracking-[-0.02em]">
            Almeda Electronics
          </span>
          <VerifiedBadge size={14} />
        </div>

        <div className="text-tn-ink2 mt-1.5 flex items-center gap-[7px] text-[13.5px]">
          <Icon name="pin" size={14} className="text-tn-mute shrink-0" />
          Bole &middot; Atlas &middot; member since 2022
        </div>

        <div className="bg-tn-green-soft mt-[18px] rounded-[13px] border border-[#CDE9DA] px-4 py-3.5">
          <div className="mb-[11px] text-[10.5px] font-extrabold tracking-[0.08em] text-[#157049] uppercase">
            Verification on file
          </div>
          {verificationChecks.map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2.5 py-[5px]">
              <span className="bg-tn-green inline-flex size-[22px] shrink-0 items-center justify-center rounded-full text-white">
                <Icon name="check" size={13} strokeWidth={2.6} />
              </span>
              <span className="text-tn-ink2 flex-1 text-[13.5px] font-semibold">{label}</span>
              <Icon name={icon} size={15} className="shrink-0 text-[#9DBDA9]" />
            </div>
          ))}
        </div>

        <div className="border-tn-hair2 font-tn-mono text-tn-ink2 mt-4 flex items-center justify-between border-t pt-3.5 text-[12px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-tn-green size-1.5 rounded-full" />
            98% reply rate
          </span>
          <span>142 listings &middot; ~3m reply</span>
        </div>
      </div>
    </div>
  );
}
