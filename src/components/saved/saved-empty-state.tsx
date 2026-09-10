import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

export function SavedEmptyState() {
  return (
    <div className="border-tn-hair flex flex-col items-center justify-center rounded-[18px] border bg-white px-6 py-20 text-center">
      <div className="bg-tn-red-soft text-tn-red mb-4 inline-flex size-14 items-center justify-center rounded-2xl">
        <Icon name="heart" size={26} />
      </div>
      <h2 className="text-tn-ink text-xl font-extrabold tracking-[-0.02em]">
        Nothing saved yet
      </h2>
      <p className="text-tn-mute mt-2 max-w-sm text-sm leading-relaxed">
        Items you save while browsing will appear here so you can monitor price drops, stock updates, and revisit them anytime.
      </p>
      <div className="mt-6">
        <Pill kind="solid" size="md" href="/products" iconAfter="arrow">
          Browse products
        </Pill>
      </div>
    </div>
  );
}
