# Tinsae — Assets for the codebase

Drop this folder into your repo (`/public/assets` or `/src/assets`) and wire the four files below. Everything here is framework-agnostic.

## What's actually an asset

The Tinsae designs are **code, not artwork** — every product image is a CSS/SVG silhouette placeholder, every map is hand-drawn SVG, and every card is markup. So there are only four real things to export, and they're all here:

| Folder | What | How to use |
|---|---|---|
| `logo/` | 15 finalised SVGs | Reference directly |
| `icons/` | 47-icon set — sprite, individual SVGs, React component | Import `Icon.tsx` or the sprite |
| `tokens/` | Colour, type, radius, shadow, layout + the freshness rule | Import the CSS or JSON |
| `fonts/` | The three typefaces | Import `fonts.css` |

## 1. Fonts — do this first
```html
<link rel="stylesheet" href="/assets/fonts/fonts.css">
```
Or in a bundler: `import '@/assets/fonts/fonts.css'`.

**Roles are strict:**
- **Plus Jakarta Sans** — all UI and prose
- **JetBrains Mono** — **every number.** Prices, counts, stats, timestamps, percentages, IDs. This is a big part of the product's character; don't let numbers fall back to the sans.
- **Noto Sans Ethiopic** — the ትንሳኤ wordmark and watermarks only. Never body copy.

For production, self-host and subset — Noto Sans Ethiopic is a large face used for a handful of glyphs.

## 2. Tokens
```css
@import '/assets/tokens/tinsae-tokens.css';
```
Gives you `--tn-*` custom properties plus the three shared behaviours (`.tn-card` hover lift, `.tn-pill` hover, `.tn-num` for mono numerals).

**Tailwind** — extend from the JSON instead:
```js
// tailwind.config.js
const t = require('./assets/tokens/tinsae-tokens.json');
module.exports = { theme: { extend: {
  colors: { ...t.color, cat: t.category },
  fontFamily: t.fontFamily,
  borderRadius: t.borderRadius,
  boxShadow: t.boxShadow,
}}};
```

**`tokens/freshness.ts` is the important one.** It holds the single stock-freshness rule — ≤6h fresh, 7–24h aging, >24h hidden — plus the colours and the `ETB()` money formatter. Import it everywhere stock age or a price is rendered and never re-implement the thresholds; the prototypes forked them (some files used a 12h aging cutoff) and that inconsistency is exactly what this file exists to prevent. 24h is canonical because it's what the Trust & Safety page promises publicly.

## 3. Icons — three ways, pick one
**React / Next** — copy `icons/Icon.tsx` into your components:
```tsx
import { Icon } from '@/assets/icons/Icon';
<Icon name="shield" size={18} className="text-green-600" />
<Icon name="tg" size={20} />
```
47 names, all 24×24, inheriting `currentColor`. `ICON_NAMES` is exported for typeahead and audits.

**Sprite** — inline `icons/tinsae-icons.svg` once near `<body>`, then:
```html
<svg width="18" height="18"><use href="#tn-shield"/></svg>
```

**Individual files** — `icons/svg/shield.svg` etc., for CSS backgrounds or an icon pipeline.

`tg` and `star` are filled; the other 48 are 1.6px strokes with round caps. **Lucide is a close match** if you'd rather use a maintained library — swap it in wholesale rather than mixing sets.

## 4. Logo
`logo/README.md` has clear space, minimum sizes, and the don'ts. The short version:

| File | Use |
|---|---|
| `tinsae-logo-orange.svg` | Primary — white lockup on `#CC3000` |
| `tinsae-logo-dark.svg` | On dark grounds |
| `tinsae-logo-light.svg` | On white / light grounds |
| `tinsae-logo-tagline*.svg` | With "ትንሳኤ · verified shops" — use where the brand needs explaining |
| `tinsae-mark.svg` + `-white` / `-ink` / `-green` | The rising check alone — avatars, favicons, tight spaces |
| `tinsae-favicon.svg`, `tinsae-app-icon.svg` | Browser tab, app icon |

The prototypes draw the wordmark as live text (`"ትንሳኤ" + "Tinsae"` in two spans). **Replace those with the real files** — it's the most common thing to miss when porting a screen.

## What is NOT here, and still needs producing

- **Product photography.** Every product image across all 34 screens is a silhouette placeholder (`ProdPlaceholder`, keyed by `phone | laptop | audio | tablet | camera | plug`). Real shots go in a 1:1 crop on a `#F7F6F2` ground. Keep the silhouette as the no-photo fallback.
- **Shop photography.** Shop covers are generated gradients with a 45° hatch; the design intends real storefront photos.
- **Maps.** Every map is hand-drawn SVG. Wire a real provider (Mapbox / MapLibre / Google) and keep the visual language: muted olive-grey ground, white roads, one warm accent artery, neighbourhood labels only, no POI clutter.
- **The UI components themselves.** Pill, Tag, Fresh, ProductCard, Nav, Footer, and the owner shell are specified in `design_handoff_all/_shared/SHARED.md`, not shipped as code — build them in your own component library.

## Where the specs live
`design_handoff_all/` — one folder per screen, plus `_shared/SHARED.md` (the full design system) and `_shared/MOBILE.md`. Read `SHARED.md` before building anything; every screen spec assumes it.
