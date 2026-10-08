export type ClickLike = Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey" | "defaultPrevented">;
export type AnchorLike = { href: string; target: string; hasAttribute(name: string): boolean };

/**
 * Whether a click on this link leaves the current page in this tab — the case
 * that would drop unsaved edits. New-tab clicks, downloads and in-page hash
 * links keep the page, so they pass through.
 */
export function leavesPage(event: ClickLike, anchor: AnchorLike, current: URL): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  let next: URL;
  try {
    next = new URL(anchor.href, current);
  } catch {
    return false;
  }
  if (!/^https?:$/.test(next.protocol)) return false;
  const samePage =
    next.origin === current.origin && next.pathname === current.pathname && next.search === current.search;
  return !samePage;
}
