import { Icon } from "@/components/tinsae/icon";

export function TrustDetails() {
  return (
    <section className="mx-auto mt-20 max-w-[1240px] px-6 lg:mt-24 lg:px-7">
      <div className="grid gap-[18px] md:grid-cols-2">
        <div className="bg-tn-ink relative overflow-hidden rounded-[20px] px-7 py-9 sm:px-[38px] sm:py-10">
          <div className="mb-5 flex size-[54px] items-center justify-center rounded-[15px] bg-white/10">
            <Icon name="shield" size={25} className="text-[#FF9E80]" />
          </div>
          <h3 className="mb-3 text-2xl font-extrabold tracking-[-0.02em] text-white">
            Tinsae never touches your money.
          </h3>
          {/* The last clause is the actual security argument — keep it verbatim. */}
          <p className="max-w-[420px] text-[15px] leading-[1.6] text-white/[0.66]">
            We don&rsquo;t take payments, hold deposits, or offer escrow. You pay the shop directly,
            in person, on your own terms &mdash; which means there&rsquo;s no Tinsae account anyone
            can trick you into paying.
          </p>
        </div>

        <div className="border-tn-hair rounded-[20px] border bg-white px-7 py-9 sm:px-[38px] sm:py-10">
          <div className="bg-tn-red-soft mb-5 flex size-[54px] items-center justify-center rounded-[15px]">
            <Icon name="eye" size={25} className="text-tn-red" />
          </div>
          <h3 className="text-tn-ink mb-3 text-2xl font-extrabold tracking-[-0.02em]">
            Your details stay yours.
          </h3>
          <p className="text-tn-mute max-w-[420px] text-[15px] leading-[1.6]">
            Shops see only what you choose to share when you make contact. We don&rsquo;t sell your
            data, and you can browse, compare and set alerts without ever revealing your number until
            you&rsquo;re ready.
          </p>
        </div>
      </div>
    </section>
  );
}
