"use client";

import { useEffect } from "react";
import { leavesPage } from "@/lib/navigation-guard";

export const UNSAVED_CHANGES_MESSAGE = "You have unsaved changes. Leave without saving?";

/**
 * Asks before leaving the page while `dirty`: on reload/close (the browser's
 * own prompt) and on any link click, which covers Next's client-side <Link>
 * navigation that `beforeunload` never sees.
 */
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    // Capture phase on document runs before React's root listener, so a
    // cancelled click never reaches <Link>'s onClick.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || !leavesPage(event, anchor, new URL(window.location.href))) return;
      if (!window.confirm(UNSAVED_CHANGES_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}
