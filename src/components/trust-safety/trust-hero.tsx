import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

const verificationChecks = [
  "Phone & owner identity",
  "Business registration",
  "In-person store visit",
] as const;

export function TrustHero() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="flex flex-col gap-5 pt-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-tn-hair bg-tn-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-tn-ink">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CC3000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z"></path><path d="M9 12l2 2 4-4"></path></svg>
          Trust & safety
        </div>

        <h1 className="max-w-[620px] text-4xl font-black tracking-[-0.06em] text-tn-ink md:text-5xl lg:text-[4rem]">
          What <span className="text-tn-red">“verified”</span> actually means.
        </h1>

        <p className="max-w-[620px] text-base leading-7 text-zinc-700 md:text-lg">
          The badge isn&apos;t decoration. Every shop on Tinsae has to pass a real check: a real business, a real address,
          and a real in-person review before it can show up in search.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Pill kind="solid" size="lg" iconAfter="arrow" href="/products">
            Browse verified shops
          </Pill>
          <Pill kind="outline" size="lg" icon="tg" href="/how-it-works">
            How this works
          </Pill>
        </div>
      </div>

      <div className="w-full max-w-[420px] justify-self-end overflow-hidden rounded-[28px] border border-[#e7e1db] bg-[#f3f1ee] p-0 shadow-[0_18px_60px_rgba(16,24,40,0.08)]">
        <div className="bg-[#0d223a] px-4 pb-3 pt-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/10 text-[0.9rem] font-black text-white shadow-inner shadow-white/10">
            AC
          </div>
        </div>

        <div className="bg-[#f3f1ee] px-4 pb-3 pt-3">
          <div className="mb-3 flex items-center gap-2.5">
            <h3 className="text-[1.7rem] font-black tracking-[-0.06em] text-tn-ink">
              Almeda Electronics
            </h3>
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#1ea76c] text-white shadow-sm">
              <Icon name="check" size={14} />
            </span>
          </div>

          <div className="mb-4 flex items-center gap-2 text-[0.92rem] text-zinc-600">
            <span className="inline-flex size-4 items-center justify-center text-zinc-500">
              <Icon name="pin" size={14} />
            </span>
            <span>Bole · Atlas · member since 2022</span>
          </div>

          <div className="rounded-[16px] bg-[#dfeee7] p-3.5">
            <p className="mb-3 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#1d5a46]">
              Verification on file
            </p>

            <div className="space-y-2.5">
              {verificationChecks.map((item, index) => (
                <div key={item} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#1ea76c] text-white">
                      <Icon name="check" size={12} />
                    </span>
                    <span className="text-[0.95rem] font-medium text-[#132328]">{item}</span>
                  </div>
                  <span className="inline-flex size-5 items-center justify-center rounded-md border border-[#a9c8bb] bg-white/30 text-[#1d5a46]">
                    {index === 0 ? <Icon name="phone" size={12} /> : index === 1 ? <Icon name="building" size={12} /> : <Icon name="pin" size={12} />}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#d9d1ca] pt-3 text-[0.92rem] text-[#182a32]">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-2.5 rounded-full bg-[#1ea76c]" />
              <span className="font-medium">98% reply rate</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span>142 listings</span>
              <span className="text-zinc-500">·</span>
              <span>~3m reply</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
