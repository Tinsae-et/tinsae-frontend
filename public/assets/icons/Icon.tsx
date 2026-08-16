// Tinsae icon set — 47 icons, 24x24, inherits currentColor.
// Usage: <Icon name="shield" size={18} /> · <Icon name="tg" size={20} className="text-sky-500" />
import * as React from 'react';

const STROKE: Record<string, React.ReactNode> = {
  back: <><path d="M15 5l-7 7 7 7"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
  share: <><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"/></>,
  heart: <><path d="M20.8 6.6a5.5 5.5 0 00-9.3-3 5.5 5.5 0 00-9.3 6c1.6 4 9.3 9.4 9.3 9.4s7.7-5.4 9.3-9.4a5.5 5.5 0 000-3z"/></>,
  check: <><path d="M5 12.5l4.5 4.5L19 7"/></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
  shield: <><path d="M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z"/><path d="M9 12l2 2 4-4"/></>,
  chevron: <><path d="M9 6l6 6-6 6"/></>,
  chevd: <><path d="M6 9l6 6 6-6"/></>,
  bolt: <><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  minus: <><path d="M5 12h14"/></>,
  spec: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  msg: <><path d="M21 11.5a8.4 8.4 0 01-1 4 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-4-1L3 21l1.9-5.4a8.4 8.4 0 01-1-4 8.5 8.5 0 014.7-7.6 8.4 8.4 0 014-1 8.5 8.5 0 015.6 2.3 8.5 8.5 0 012.8 5.6z"/></>,
  home: <><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z"/></>,
  box: <><path d="M21 8L12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></>,
  menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></>,
  laptop: <><rect x="3" y="5" width="18" height="11" rx="1"/><path d="M2 20h20"/></>,
  audio: <><path d="M9 18V6l12-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  tablet: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M11 18h2"/></>,
  plug: <><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0z M12 18v4"/></>,
  camera: <><path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/></>,
  arrow: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
  bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></>,
  gallery: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></>,
  sliders: <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></>,
  sort: <><path d="M3 6h18M6 12h12M10 18h4"/></>,
  rows: <><rect x="3" y="4" width="18" height="5" rx="1"/><rect x="3" y="13" width="18" height="5" rx="1"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></>,
  tag: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-7.2-7.2a2 2 0 01-.6-1.4V4a1 1 0 011-1h7.6a2 2 0 011.4.6l7.2 7.2a2 2 0 010 2.8z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor"/></>,
  trash: <><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  pulse: <><path d="M3 12h4l3-9 4 18 3-9h4"/></>,
  building: <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/></>,
  car: <><path d="M5 11l1.6-4.3A2 2 0 018.5 5.4h7a2 2 0 011.9 1.3L19 11M4 11h16a1 1 0 011 1v4h-2M5 16H3v-4a1 1 0 011-1M5 16v1.5M19 16v1.5M5 16h14"/><circle cx="7.5" cy="16.5" r="1.6"/><circle cx="16.5" cy="16.5" r="1.6"/></>,
  shirt: <><path d="M8.5 3L12 6l3.5-3 4.5 3.2-2.2 3.3L16 8.5V21H8V8.5L6.2 9.5 4 6.2z"/></>,
  sofa: <><path d="M5 11V8.5A2.5 2.5 0 017.5 6h9A2.5 2.5 0 0119 8.5V11"/><path d="M4.5 11A2.5 2.5 0 002 13.5V17h20v-3.5a2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 00-2.5 2.5V14H7v-.5A2.5 2.5 0 004.5 11z"/><path d="M5 17v2M19 17v2"/></>,
  wrench: <><path d="M15 6.5a3.8 3.8 0 00-5 4.9l-6.2 6.2 2.6 2.6 6.2-6.2a3.8 3.8 0 004.9-5l-2.4 2.4-2.1-2.1z"/></>,
  ellipsis: <><circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
};

const FILLED: Record<string, React.ReactNode> = {
  tg: <><path d="M22.05 2.5L1.65 10.4c-1.4.55-1.4 1.4-.25 1.7l5.2 1.65 12.05-7.6c.55-.35 1.05-.15.65.25l-9.75 8.8 8.5 6.3c.95.55 1.65.25 1.9-.85l3.45-16.15c.4-1.5-.55-2.15-1.35-1.9z"/></>,
  star: <><path d="M12 2l3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z"/></>,
};

export type IconName = keyof typeof STROKE | keyof typeof FILLED;

export function Icon({ name, size = 18, strokeWidth = 1.6, ...rest }: {
  name: IconName; size?: number; strokeWidth?: number;
} & React.SVGProps<SVGSVGElement>) {
  const isFilled = name in FILLED;
  const body = isFilled ? FILLED[name as keyof typeof FILLED] : STROKE[name as keyof typeof STROKE];
  if (!body) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? undefined : 'currentColor'}
      strokeWidth={isFilled ? undefined : strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      {...rest}
    >{body}</svg>
  );
}

export const ICON_NAMES = ['back', 'search', 'filter', 'share', 'heart', 'check', 'pin', 'clock', 'shield', 'chevron', 'chevd', 'bolt', 'plus', 'minus', 'spec', 'eye', 'msg', 'home', 'box', 'user', 'menu', 'phone', 'laptop', 'audio', 'tablet', 'plug', 'camera', 'arrow', 'bell', 'gallery', 'sliders', 'sort', 'rows', 'grid', 'tag', 'trash', 'edit', 'logout', 'pulse', 'building', 'car', 'shirt', 'sofa', 'wrench', 'ellipsis', 'tg', 'star'] as const;
