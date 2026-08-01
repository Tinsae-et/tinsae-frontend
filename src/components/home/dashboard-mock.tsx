import { Icon } from "@/components/tinsae/icon";
import { VerifiedBadge } from "@/components/tinsae/verified-badge";
import { ProdPlaceholder } from "@/components/tinsae/prod-placeholder";

// Decorative. Ported from `DashboardHero` (tinsae-home-v2.jsx) — a stylized
// "product screenshot" comparing a phone across four Bole shops. The numbers
// are demo copy from the design deck, not live data.

const ROWS: {
  n: string;
  loc: string;
  p: number;
  fresh: string;
  best?: boolean;
  aging?: boolean;
  tag?: string;
  c: string;
}[] = [
  { n: "Almeda Electronics", loc: "Bole · Atlas", p: 142500, fresh: "1h", best: true, c: "#0F2A4D" },
  { n: "Kuriftu Mobile", loc: "Bole · Medhanialem", p: 138900, fresh: "8h", tag: "Open box", c: "#7A2E2E" },
  { n: "Mosaic Tech Hub", loc: "Bole · Friendship", p: 144800, fresh: "4h", c: "#3B5742" },
  { n: "Axum Digital", loc: "Bole · Olympia", p: 145200, fresh: "14h", aging: true, c: "#2D4A5E" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export function DashboardMock() {
  return (
    <div className="mx-auto max-w-[1180px] px-6 lg:px-7">
      <div className="overflow-hidden rounded-[18px] border border-tn-hair bg-white shadow-[0_40px_90px_rgba(11,11,11,0.16)]">
        {/* window chrome */}
        <div className="flex h-[42px] items-center gap-2 border-b border-tn-hair bg-tn-paper px-4">
          <div className="flex gap-[7px]">
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} className="size-[11px] rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="font-tn-mono text-tn-mute mx-auto flex h-6 max-w-[420px] flex-1 items-center justify-center gap-1.5 rounded-[7px] border border-tn-hair bg-white text-[11px]">
            <Icon name="shield" size={11} className="text-tn-green" />
            tinsae.et / iphone-15-pro-256
          </div>
        </div>

        <div className="grid min-h-[330px] grid-cols-1 md:grid-cols-[1fr_1.5fr]">
          {/* product */}
          <div className="relative flex flex-col items-center justify-center bg-[linear-gradient(180deg,#16110F_0%,#050505_100%)] p-6">
            <span className="bg-white/95 text-tn-green absolute top-[18px] left-[18px] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold">
              <span className="bg-tn-green size-1.5 rounded-full" />
              Confirmed today
            </span>
            <ProdPlaceholder kind="phone" />
          </div>

          {/* comparison */}
          <div className="p-6">
            <p className="text-tn-mute text-[11px] font-bold tracking-[0.05em] uppercase">Apple</p>
            <h3 className="text-tn-ink mt-1 text-[21px] font-extrabold tracking-[-0.02em]">
              iPhone 15 Pro · 256GB
            </h3>
            <div className="mt-2.5 mb-3.5 flex items-baseline gap-2">
              <span className="text-tn-mute text-[11px] font-bold tracking-[0.05em] uppercase">
                From
              </span>
              <span className="font-tn-mono text-tn-red text-[26px] font-semibold tracking-[-0.02em]">
                ETB 138,900
              </span>
              <span className="text-tn-mute text-[12.5px]">across 5 shops</span>
            </div>

            <div className="flex flex-col gap-2">
              {ROWS.map((r) => (
                <div
                  key={r.n}
                  className={cnRow(r)}
                >
                  <div
                    className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                    style={{ background: r.c }}
                  >
                    {initials(r.n)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-tn-ink truncate text-[13px] font-bold">{r.n}</span>
                      <VerifiedBadge size={11} />
                      {r.tag && (
                        <span className="text-tn-ink2 bg-tn-hair2 rounded px-1.5 py-px text-[9.5px] font-bold">
                          {r.tag}
                        </span>
                      )}
                    </div>
                    <div className="font-tn-mono text-tn-mute mt-0.5 text-[11px]">
                      <span
                        className="mr-1.5 inline-block size-[5px] rounded-full"
                        style={{ background: r.aging ? "#B8741F" : "#1F8A5B" }}
                      />
                      {r.loc} · {r.fresh} ago
                    </div>
                  </div>
                  <div
                    className={`font-tn-mono text-[15px] font-semibold ${r.best ? "text-tn-red" : "text-tn-ink"}`}
                  >
                    ETB {r.p.toLocaleString("en-US")}
                  </div>
                  <div
                    className={
                      r.best
                        ? "bg-tn-red rounded-[7px] px-2.5 py-1 text-[11.5px] font-bold text-white"
                        : "text-tn-ink border-tn-hair rounded-[7px] border bg-white px-2.5 py-1 text-[11.5px] font-bold"
                    }
                  >
                    Contact
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cnRow(r: (typeof ROWS)[number]) {
  return `flex items-center gap-3 rounded-[10px] px-3 py-2.5 ${
    r.best ? "border border-tn-red bg-tn-red-soft" : "border border-tn-hair bg-white"
  }`;
}
