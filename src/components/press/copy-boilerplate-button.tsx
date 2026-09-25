"use client";

import { useEffect, useState } from "react";
import { Pill } from "@/components/tinsae/pill";

// navigator.clipboard needs a secure context and can be blocked by the
// browser; the textarea + execCommand path still works in those cases.
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function CopyBoilerplateButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Pill
      kind={copied ? "dark" : "outline"}
      size="sm"
      icon={copied ? "check" : "spec"}
      onClick={async () => setCopied(await copyText(text))}
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy boilerplate"}</span>
    </Pill>
  );
}
