import { Icon, type IconName } from "@/components/tinsae/icon";

// Decorative. Ported from `OrbitRing` (tinsae-home-v2.jsx): three concentric
// circles, a 38s-rotating layer of six category nodes that counter-rotate to
// stay upright, and the ትንሳኤ "VERIFIED" center node floating gently.
// Hidden entirely on small screens (it's decoration) and static under
// prefers-reduced-motion (handled globally via [data-orbit]).

const NODES: { icon: IconName; color: string }[] = [
  { icon: "phone", color: "#CC3000" },
  { icon: "laptop", color: "#1F8A5B" },
  { icon: "audio", color: "#2A6FDB" },
  { icon: "tablet", color: "#7A2EBF" },
  { icon: "camera", color: "#D9810A" },
  { icon: "plug", color: "#0E7C86" },
];

const R = 168;

export function OrbitRing() {
  return (
    <div
      aria-hidden
      className="relative mx-auto hidden h-[420px] w-[420px] items-center justify-center xl:flex"
    >
      {[420, 316, 212].map((d, i) => (
        <div
          key={d}
          className="absolute rounded-full"
          style={{
            width: d,
            height: d,
            border: `1px solid ${i === 0 ? "#ECEAE3" : "#F2F0EA"}`,
          }}
        />
      ))}

      <div
        data-orbit
        className="absolute animate-[tnOrbit_38s_linear_infinite]"
        style={{ width: R * 2, height: R * 2 }}
      >
        {NODES.map((n, idx) => {
          const ang = (idx / NODES.length) * 2 * Math.PI - Math.PI / 2;
          const x = R + R * Math.cos(ang) - 33;
          const y = R + R * Math.sin(ang) - 33;
          return (
            <div
              key={idx}
              data-orbit
              className="absolute animate-[tnOrbitR_38s_linear_infinite]"
              style={{ left: x, top: y, width: 66, height: 66 }}
            >
              <div className="flex size-[66px] items-center justify-center rounded-[18px] border border-tn-hair bg-white shadow-[0_10px_28px_rgba(11,11,11,0.08)]">
                <div
                  className="inline-flex size-10 items-center justify-center rounded-[11px]"
                  style={{ background: `${n.color}14` }}
                >
                  <span style={{ color: n.color }}>
                    <Icon name={n.icon} size={21} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        data-orbit
        className="bg-tn-ink relative flex size-[128px] animate-[tnFloat_6s_ease-in-out_infinite] flex-col items-center justify-center rounded-full shadow-[0_18px_50px_rgba(11,11,11,0.30)]"
      >
        <span className="font-tn-amh text-[30px] font-bold leading-none text-white">ትንሳኤ</span>
        <span className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-bold tracking-[0.10em] text-white">
          <span className="bg-tn-green size-[5px] rounded-full" />
          VERIFIED
        </span>
      </div>
    </div>
  );
}
