// Design block 4 — the "Trusted by" wordmark strip under the dashboard mock.
// PLACEHOLDER: shop names in the trust strip. Use real partner shops (with
// their consent) or getShops({ verifiedOnly: true }) before launch.
const SHOPS = ["Almeda", "Mosaic Tech", "Kuriftu", "Axum Digital", "Gada", "Friendship Mobile"];

export function TrustStrip() {
  return (
    <div className="mx-auto mt-10 max-w-[1480px] border-t border-tn-hair2 px-6 pt-7 pb-14 sm:px-8 lg:px-12 xl:px-16">
      <p className="text-tn-mute mb-5 text-center text-xs font-bold tracking-[0.14em] uppercase">
        Trusted by the shops that keep Ethiopia running
      </p>
      <div className="flex flex-wrap items-center justify-center gap-12 opacity-70">
        {SHOPS.map((s) => (
          <span key={s} className="text-tn-ink text-lg font-extrabold tracking-tight">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
