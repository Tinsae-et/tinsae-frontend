import Link from "next/link";
import { Icon } from "@/components/tinsae/icon";

export function DashboardNoShop() {
  return (
    <section className="mx-auto max-w-3xl rounded-[20px] border border-tn-hair bg-white p-8 text-center shadow-sm sm:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tn-red-soft text-tn-red">
        <Icon name="building" size={25} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.025em] text-tn-ink">
        Set up your shop first
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-tn-mute">
        Create your shop settings before adding products or connecting Telegram.
      </p>
      <Link
        href="/shop/onboarding"
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-tn-red px-6 text-[15px] font-bold text-white shadow-[0_8px_22px_rgba(204,48,0,0.26)] transition hover:bg-tn-red-dark"
      >
        <Icon name="plus" size={17} />
        Start shop setup
      </Link>
    </section>
  );
}
