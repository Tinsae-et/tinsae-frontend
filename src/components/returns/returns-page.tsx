import { Icon, type IconName } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { SectionHead } from "@/components/trust-safety/section-head";

const protections: {
  icon: IconName;
  tone: string;
  title: string;
  body: string;
}[] = [
  {
    icon: "eye",
    tone: "bg-tn-red-soft text-tn-red",
    title: "Inspect before you pay",
    body: "This is the real protection, and it is why Tinsae is built around meeting in person. Power it on, check the IMEI, test the camera and the ports. Nothing is final until you hand over the money.",
  },
  {
    icon: "spec",
    tone: "bg-[#EEF4FF] text-[#2A6FDB]",
    title: "The terms are on the listing",
    body: 'Every shop states its warranty and return window before you contact them. If it says "7-day exchange", that is what they have committed to publicly.',
  },
  {
    icon: "msg",
    tone: "bg-tn-green-soft text-tn-green",
    title: "The conversation is on the record",
    body: "What the shop promised you over Telegram is logged against the listing. If they later dispute it, there is a record we can both look at.",
  },
  {
    icon: "shield",
    tone: "bg-[#FFF5E7] text-tn-warn",
    title: "Badges depend on honouring it",
    body: "A shop that refuses a warranty it advertised loses its verified badge. That is the only leverage we have, and we use it.",
  },
];

const warranties = [
  [
    "Manufacturer warranty",
    "12-24 months",
    "The brand",
    "Honoured at an authorised service centre, not the shop. Keep the box and the receipt - you will need both.",
  ],
  [
    "Tinsae-verified shop warranty",
    "6-12 months",
    "The shop",
    "The shop repairs or replaces it themselves. Stated on the listing and enforceable against their badge.",
  ],
  [
    "Shop warranty",
    "1-6 months",
    "The shop",
    "Common on open-box and refurbished stock. Ask exactly what it covers before you pay - warranty can mean repair only.",
  ],
  [
    "No warranty",
    "-",
    "Nobody",
    "Used and clearance items. Legal and normal, but inspect twice as carefully - there is no recourse after you walk out.",
  ],
];

const steps: [IconName, string, string, string][] = [
  [
    "building",
    "01",
    "Go back to the shop",
    "Within their stated window, with the item, the box and proof of purchase. Most problems end here - shops with a badge to protect generally fix things.",
  ],
  [
    "tg",
    "02",
    "Message them on Telegram",
    "If a visit does not resolve it, put it in writing in the same chat where you agreed the sale. Restate what was promised and what is wrong.",
  ],
  [
    "shield",
    "03",
    "Report it to Tinsae",
    "One tap from the listing or the chat. We read every report within 24 hours and can freeze the shop's listings while we look.",
  ],
  [
    "check",
    "04",
    "We mediate - and act",
    "We contact the shop with the record of what was advertised. If they refuse terms they published, the badge comes off and we say why.",
  ],
];

const faqs = [
  [
    "Does Tinsae have a return policy?",
    "No - and no marketplace that never takes your money honestly can. Each shop sets its own return window and warranty, states it on the listing, and honours it directly. Our job is to make those terms visible before you buy and to hold shops to them afterwards.",
  ],
  [
    "A shop is refusing the warranty it advertised. What now?",
    "Report it - one tap from the listing, or message @TinsaeTrust. We have the listing as it was published and the chat where you agreed the sale. A shop that refuses terms it advertised loses its verified badge, and we tell buyers why.",
  ],
  [
    "I paid a deposit and the shop went quiet.",
    "We are very sorry - and this is the case we can help with least, because the money never passed through us. Never pay before you arrive and inspect. Report the shop anyway: it will be removed, which protects the next person.",
  ],
  [
    "Can I return something just because I changed my mind?",
    "Only if that shop offers it, and most do not. Change-of-mind returns are rare in Addis electronics retail. Because you inspect and test in person before paying, there is far less need for one than with an online order.",
  ],
  [
    "What about a manufacturer warranty - do I go to the shop?",
    "Usually to an authorised service centre for the brand, not the shop. Keep the box, the receipt and any warranty card. Ask the shop which centre to use and note it down before you leave.",
  ],
  [
    "Is a refurbished item worth the risk?",
    "Often, if the warranty is real. Check who honours it and for how long, and test more carefully than you would a sealed item. Refurbished stock on Tinsae must be labelled as such - a shop mislabelling it is a badge issue.",
  ],
];

function ReturnsHero() {
  return (
    <section className="border-tn-hair2 relative overflow-hidden border-b bg-[radial-gradient(120%_90%_at_86%_-10%,#FFF1EB_0%,rgba(255,241,235,0)_52%)]">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 pt-14 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-7 lg:pt-[76px] lg:pb-16">
        <div>
          <div className="border-tn-hair text-tn-ink2 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-[7px] text-[13px] font-bold shadow-[0_2px_10px_rgba(11,11,11,0.04)]">
            <Icon name="shield" size={15} className="text-tn-red" />
            Returns &amp; warranty
          </div>
          <h1 className="text-tn-ink mt-[22px] max-w-[580px] text-[40px] leading-[1.0] font-extrabold tracking-[-0.04em] sm:text-[54px] lg:text-[62px]">
            Your return is with
            <br />
            <span className="text-tn-red">the shop, not us.</span>
          </h1>
          <p className="text-tn-mute mt-6 max-w-[500px] text-base leading-[1.55] font-medium sm:text-[18.5px]">
            Tinsae never handles your money, so we cannot refund it. What we can
            do - and do - is make every shop state its terms before you buy, and
            take the badge off anyone who breaks them.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[22px] bg-tn-ink p-7 shadow-[0_30px_70px_rgba(11,11,11,0.2)] sm:p-8 lg:justify-self-end">
          <div
            aria-hidden
            className="font-tn-amh pointer-events-none absolute -right-7 -bottom-11 text-[150px] leading-none font-bold text-white/[0.05]"
          >
            ት
          </div>
          <div className="relative">
            <div className="font-tn-mono text-[11px] font-bold tracking-[0.12em] text-white/55">
              THE ONE RULE
            </div>
            <h2 className="mt-4 text-[26px] leading-[1.15] font-extrabold tracking-[-0.03em] text-white sm:text-[27px]">
              Never pay before you have
              <br />
              <span className="text-[#FFB69E]">held it in your hands.</span>
            </h2>
            <p className="mt-3.5 text-sm leading-[1.6] font-medium text-white/70">
              Every protection on this page is weaker than the one you already
              have: inspecting the device in the shop, before any money changes
              hands.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-white/15 pt-4">
              {["No deposits", "No advance transfers", "No holding fees"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/[0.08] px-3 text-xs font-bold text-white/85"
                  >
                    <Icon
                      name="minus"
                      size={12}
                      className="text-[#FF9E80]"
                      strokeWidth={3}
                    />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProtectSection() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <SectionHead
        eyebrow="What actually protects you"
        title="Four things, in order of usefulness."
        intro="We would rather be straight with you about where our power ends than imply a guarantee we cannot deliver."
      />
      <div className="mt-9 grid gap-4 md:grid-cols-2">
        {protections.map((item) => (
          <article
            key={item.title}
            className="border-tn-hair rounded-[16px] border bg-white p-6"
          >
            <span
              className={`inline-flex size-10 items-center justify-center rounded-[11px] ${item.tone}`}
            >
              <Icon name={item.icon} size={18} />
            </span>
            <h3 className="mt-4 text-[16.5px] font-extrabold tracking-[-0.02em]">
              {item.title}
            </h3>
            <p className="text-tn-mute mt-2 text-[13.5px] leading-[1.55]">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WarrantySection() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <SectionHead
        eyebrow="Reading a listing"
        title={'Four kinds of "warranty".'}
        intro="They are not equivalent, and the word alone tells you almost nothing. This is what each one means on a Tinsae listing."
      />
      <div className="border-tn-hair mt-9 overflow-hidden rounded-[18px] border">
        <div className="hidden grid-cols-[1.5fr_140px_120px_2fr] gap-[18px] bg-tn-paper px-[22px] py-3 text-[10px] font-bold tracking-[0.05em] text-tn-mute uppercase md:grid">
          <span>Type</span>
          <span>Typical length</span>
          <span>Who honours it</span>
          <span>What to know</span>
        </div>
        {warranties.map(([label, length, who, body]) => (
          <div
            key={label}
            className="border-tn-hair2 grid gap-2 border-t px-5 py-4 first:border-t-0 md:grid-cols-[1.5fr_140px_120px_2fr] md:items-center md:gap-[18px] md:px-[22px] md:py-[18px]"
          >
            <strong className="text-sm font-extrabold md:text-[14.5px]">
              {label}
            </strong>
            <span className="font-tn-mono text-tn-ink2 text-xs font-semibold">
              {length}
            </span>
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${who === "The shop" ? "bg-tn-green-soft text-[#157049]" : who === "The brand" ? "bg-tn-green-soft text-[#157049]" : "bg-tn-paper text-tn-mute"}`}
            >
              {who}
            </span>
            <span className="text-tn-mute text-[13px] leading-[1.55]">
              {body}
            </span>
          </div>
        ))}
      </div>
      <div className="border-[#FBD9C7] bg-tn-red-soft text-tn-red-dark mt-4 flex items-start gap-3 rounded-[14px] border px-5 py-4 text-sm leading-[1.55]">
        <Icon name="bolt" size={18} className="mt-0.5 shrink-0" />
        <span>
          <strong>Ask one question before you pay:</strong> &quot;If this fails
          in a month, do I bring it to you, or to the brand?&quot; The answer
          tells you which of the four you are actually getting.
        </span>
      </div>
    </section>
  );
}

function DisputeSection() {
  return (
    <section className="mt-20 bg-tn-paper py-16 lg:mt-24 lg:py-20">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-7">
        <SectionHead
          eyebrow="If something goes wrong"
          title="Four steps, and we are the fourth."
          intro="Most cases never get past step one. When they do, we have a record of what was promised and one meaningful consequence."
        />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([icon, number, title, body]) => (
            <article
              key={number}
              className="border-tn-hair rounded-[16px] border bg-white p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="bg-tn-paper text-tn-red inline-flex size-[38px] items-center justify-center rounded-[11px]">
                  <Icon name={icon} size={18} />
                </span>
                <span className="font-tn-mono text-tn-mute text-xs font-bold">
                  {number}
                </span>
              </div>
              <h3 className="text-[16.5px] font-extrabold tracking-[-0.01em]">
                {title}
              </h3>
              <p className="text-tn-mute mt-2 text-[13.5px] leading-[1.55]">
                {body}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Pill size="sm" icon="shield" href="/contact">
            Report a shop
          </Pill>
          <Pill kind="outline" size="sm" href="/trust-and-safety">
            Read trust &amp; safety
          </Pill>
        </div>
      </div>
    </section>
  );
}

function BoundarySection() {
  const will = [
    "Show every shop's warranty terms before you contact them",
    "Keep a record of what the shop promised you in chat",
    "Read your report within 24 hours, from a real person",
    "Freeze a shop's listings while a serious case is open",
    "Remove the verified badge from a shop that breaks its terms",
  ];
  const cannot = [
    "Refund you - we never received your money",
    "Force a shop to take an item back",
    "Extend or underwrite any shop's warranty",
    "Act as an escrow, guarantor or insurer",
    "Help if you paid someone before inspecting the item",
  ];
  return (
    <section className="mx-auto mt-20 max-w-[960px] px-6 lg:mt-24 lg:px-7">
      <div className="grid gap-4 md:grid-cols-2">
        <BoundaryCard title="What Tinsae will do" positive items={will} />
        <BoundaryCard
          title="What Tinsae cannot do"
          items={cannot}
          footer="Your statutory rights as a consumer in Ethiopia are unaffected by anything on this page."
        />
      </div>
    </section>
  );
}

function BoundaryCard({
  title,
  items,
  positive = false,
  footer,
}: {
  title: string;
  items: string[];
  positive?: boolean;
  footer?: string;
}) {
  return (
    <article
      className={`rounded-[20px] border p-6 sm:p-[30px] ${positive ? "border-[#CDE9DA] bg-tn-green-soft" : "border-tn-hair bg-white"}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex size-[26px] items-center justify-center rounded-lg ${positive ? "bg-tn-green text-white" : "bg-tn-hair text-tn-mute"}`}
        >
          <Icon name={positive ? "check" : "minus"} size={15} strokeWidth={3} />
        </span>
        <h3
          className={`text-[13.5px] font-extrabold ${positive ? "text-[#157049]" : "text-tn-mute"}`}
        >
          {title}
        </h3>
      </div>
      <ul className="divide-y divide-transparent">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 py-1.5 text-sm leading-[1.55] text-tn-ink2"
          >
            <Icon
              name={positive ? "check" : "minus"}
              size={15}
              className={`mt-0.5 shrink-0 ${positive ? "text-tn-green" : "text-[#C5C3BB]"}`}
              strokeWidth={2.6}
            />
            {item}
          </li>
        ))}
      </ul>
      {footer && (
        <p className="border-tn-hair2 font-tn-mono text-tn-mute mt-4 border-t pt-3.5 text-[11px] leading-[1.6]">
          {footer}
        </p>
      )}
    </article>
  );
}

function FaqSection() {
  return (
    <section className="mx-auto mt-20 max-w-[880px] px-6 lg:mt-24 lg:px-7">
      <SectionHead center eyebrow="Questions" title="Returns, answered" />
      <div className="mt-9 flex flex-col gap-2.5">
        {faqs.map(([question, answer], index) => (
          <details
            key={question}
            open={index === 0}
            className="group overflow-hidden rounded-[16px] border border-tn-hair open:border-[#FBD9C7] open:bg-tn-red-soft"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-[15px] font-extrabold tracking-[-0.01em] marker:hidden sm:px-6 sm:py-5 sm:text-[17px]">
              <span className="flex-1">{question}</span>
              <span className="bg-tn-paper text-tn-mute inline-flex size-7 shrink-0 items-center justify-center rounded-full group-open:bg-tn-red group-open:text-white">
                <Icon name="plus" size={15} className="group-open:hidden" />
                <Icon
                  name="minus"
                  size={15}
                  className="hidden group-open:block"
                />
              </span>
            </summary>
            <p className="text-tn-ink2 max-w-[680px] px-5 pb-5 text-[15px] leading-[1.65] sm:px-6">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ReturnsPage() {
  return (
    <main className="text-tn-ink">
      <ReturnsHero />
      <ProtectSection />
      <WarrantySection />
      <DisputeSection />
      <BoundarySection />
      <FaqSection />
      <section className="mx-auto mt-20 mb-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#CC3000_0%,#E5562A_55%,#FF7A45_100%)] px-7 py-12 text-center sm:px-12 lg:py-[58px]">
          <span
            aria-hidden
            className="font-tn-amh pointer-events-none absolute -top-[30%] left-1/2 -translate-x-1/2 text-[220px] leading-none font-bold text-white/[0.09]"
          >
            ትንሳኤ
          </span>
          <div className="relative">
            <h2 className="text-[34px] leading-[1.04] font-extrabold tracking-[-0.035em] text-white sm:text-[48px]">
              Inspect it. Test it. Then pay.
            </h2>
            <p className="mx-auto mt-[18px] max-w-[520px] text-base leading-[1.5] text-white/90 sm:text-lg">
              That single habit is worth more than any policy page - including
              this one.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Pill
                kind="light"
                size="sm"
                iconAfter="arrow"
                href="/trust-and-safety"
              >
                Read trust &amp; safety
              </Pill>
              <Pill
                kind="ghost"
                size="sm"
                href="/contact"
                className="border-white/60 text-white hover:bg-white/10"
              >
                Report a shop
              </Pill>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
