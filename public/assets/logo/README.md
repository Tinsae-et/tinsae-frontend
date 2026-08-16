# Tinsae logo files

**Primary logo:** `tinsae-logo-orange.svg` — white mark + white wordmark on Tinsae orange `#CC3000`.
**Primary with tagline:** `tinsae-logo-tagline.svg` — mark + wordmark + `ትንሳኤ · verified shops`. Use this wherever the logo has room to breathe (site header, deck covers, letterhead, shop signage).
**Icon:** `tinsae-mark.svg` — the rising check. Use alone wherever the name is already present (app icon, favicon, avatar, nav at small sizes).

## Files
| File | Use |
|---|---|
| tinsae-logo-tagline.svg | **Primary with tagline.** Transparent, red mark + ink wordmark + red tagline. 286x120. |
| tinsae-logo-tagline-orange.svg | Tagline lockup on the orange badge. |
| tinsae-logo-tagline-dark.svg | Tagline lockup on ink. |
| tinsae-logo-tagline-am.svg | Tagline lockup with the fully Amharic tagline `ትንሳኤ · የተረጋገጡ ሱቆች`. |
| tinsae-logo-orange.svg | Compact orange badge, white lockup, no tagline. 242x120. |
| tinsae-logo-dark.svg | On dark/photographic backgrounds. |
| tinsae-logo-light.svg | Transparent background: red mark + ink wordmark. For white/light paper and documents. |
| tinsae-mark.svg | Mark only, red `#CC3000`. |
| tinsae-mark-white.svg | Mark only, white — for orange or dark fills. |
| tinsae-mark-ink.svg | Mark only, `#0B0B0B` — one-colour print, stamps, faxes. |
| tinsae-mark-green.svg | Mark only, `#1F8A5B` — the "Verified by Tinsae / stock confirmed" sticker only. |
| tinsae-app-icon.svg | 512x512 rounded-square app icon. |
| tinsae-favicon.svg | 32x32. The arrowhead is dropped below 20px so the stroke stays legible. |
| png/ | Raster exports, rendered from the exact SVG geometry (see below). |

## PNG exports
`png/` holds high-resolution rasters generated from the same geometry as the SVGs, with the real webfonts baked in — use them for slides, Telegram, app stores, print vendors, and anywhere SVG isn't accepted. Downscale freely; never upscale.

| PNG | Pixels | Source |
|---|---|---|
| tinsae-logo-tagline@4x.png | 1144x480 | tinsae-logo-tagline.svg |
| tinsae-logo-tagline-orange@4x.png | 1144x480 | tinsae-logo-tagline-orange.svg |
| tinsae-logo-tagline-am@4x.png | 1104x480 | tinsae-logo-tagline-am.svg |
| tinsae-logo-orange@4x.png | 968x480 | tinsae-logo-orange.svg |
| tinsae-app-icon-1024.png | 1024x1024 | tinsae-app-icon.svg |
| tinsae-mark@4x.png | 256x256 | tinsae-mark.svg |

PNGs are flattened onto white where the artwork has no background of its own (the bare mark). **When you need transparency, use the SVG.** `export.html` in this folder is the sheet the rasters are captured from — open it and re-capture if you need a different size or a new variant.

## The tagline
It reads **verified shops** — deliberately no city. Tinsae starts in Bole and the logo has to survive the next market, so never bake a place name into the file. When a specific market matters (a launch poster, a city landing page, a shop-front decal) set it as separate type near the logo, not inside it.

Use the Amharic tagline (`tinsae-logo-tagline-am.svg`) for Ethiopian-audience print, signage, and Telegram; the English tagline everywhere else. Never stack both.

Drop the tagline entirely below 160px wide, or in any cramped slot (nav bar, favicon, avatar) — use `tinsae-logo-orange.svg` or the bare mark instead.

## Colour
- Orange / brand: `#CC3000`
- Ink: `#0B0B0B`
- Verified green: `#1F8A5B`
- Never on a mid-tone. The mark needs either a white/near-white ground or a full `#CC3000` / `#0B0B0B` fill.

## Clear space
Leave the cap-height of the "T" (= 0.72x the mark's height) clear on all four sides of the lockup. Inside the orange badge this is already built in — don't crop it.

## Minimum sizes
- Tagline lockup: 160px wide on screen, 40mm in print. Below that, drop the tagline.
- Compact lockup: 96px wide on screen, 24mm in print.
- Mark alone: 20px. Below that use `tinsae-favicon.svg`, which drops the arrowhead.

## Wordmark
Plus Jakarta Sans ExtraBold (800), letter-spacing `-0.035em`. The SVG lockups reference the font by name; if you need a file that renders identically without the font installed, use the PNGs in `png/` or ask for an outlined version.

## Don'ts
- Don't rotate, skew, or add a gradient, outline, or drop shadow to the mark.
- Don't recolour it outside the four provided variants.
- Don't rebuild the lockup by hand — the mark/wordmark spacing is fixed.
- Don't put the mark inside another shape (circle, pin, speech bubble).
