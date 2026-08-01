import { ProductCard } from "@/components/products/product-card";
import { SectionHead } from "./section-head";
import type { Product } from "@/lib/types";

export function FreshListings({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-6 lg:mt-[88px]">
      <SectionHead
        eyebrow="Confirmed today"
        title="Freshest listings in Bole"
        href="/products"
        link="Browse all"
      />

      {products.length === 0 ? (
        <div className="border-tn-hair rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-tn-ink text-base font-extrabold">No confirmed listings yet</p>
          <p className="text-tn-mute mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            Listings appear here once shops confirm their stock over Telegram.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
