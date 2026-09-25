"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The keyboard and screen-reader behaviour every modal needs.
 *
 * Attach the returned ref to the element with role="dialog". While `open`:
 *  - focus moves into the dialog (first focusable element, else the dialog);
 *  - Tab and Shift+Tab cycle inside it instead of escaping to the page behind;
 *  - Escape calls `onClose` (skip with `closeOnEscape: false`, e.g. mid-delete);
 *  - the page behind stops scrolling.
 * On close, focus returns to whatever opened the dialog, so keyboard users
 * are not dropped at the top of the page.
 */
export function useModal<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  { closeOnEscape = true }: { closeOnEscape?: boolean } = {},
) {
  const ref = useRef<T>(null);
  // Latest values without re-running the effect (which would steal focus back
  // to the first element on every render).
  const onCloseRef = useRef(onClose);
  const escapeRef = useRef(closeOnEscape);
  useEffect(() => {
    onCloseRef.current = onClose;
    escapeRef.current = closeOnEscape;
  });

  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    if (!dialog) return;

    const opener = document.activeElement as HTMLElement | null;
    const first = dialog.querySelector<HTMLElement>(FOCUSABLE);
    if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");
    (first ?? dialog).focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && escapeRef.current) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === firstItem || !dialog.contains(active))) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && (active === lastItem || !dialog.contains(active))) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  return ref;
}
