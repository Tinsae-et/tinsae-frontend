import { Icon } from "@/components/tinsae/icon";

export function TrustDetails() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[26px] border border-tn-hair bg-black p-5 md:p-6">
        <div className="mb-5 flex-col justify-center gap-3">
          <span className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-tn-green-soft text-tn-green">
            <Icon name="check" size={18} />
          </span>
          <h3 className="text-2xl font-black tracking-[-0.05em] text-white">Tinsae never touches your money.</h3>
        </div>
        <p className="text-sm leading-7 text-zinc-300">
          You message the shop, agree on the device and price, then visit in person. No escrow, no wallet handoff, and no
          payment processing in between.
        </p>
      </div>

      <div className="rounded-[26px] border border-tn-hair bg-white p-5 md:p-6">
        <div className="mb-5 flex-col justify-center gap-3">
          <span className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Icon name="shield" size={18} />
          </span>
          <h3 className="text-2xl font-black tracking-[-0.05em] text-tn-ink">Your details stay yours.</h3>
        </div>
        <p className="text-sm leading-7 text-zinc-600">
          We do not ask for a full payment flow or hold personal data beyond the information needed to contact a shop and
          verify the business.
        </p>
      </div>
    </section>
  );
}
