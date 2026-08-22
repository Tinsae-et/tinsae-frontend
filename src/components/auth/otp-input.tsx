"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

const LENGTH = 6;

/**
 * The six-digit code boxes.
 *
 * Beyond the design's auto-advance and backspace-to-previous, this adds the two
 * things the prototype leaves out and a phone user needs most: paste-to-fill
 * (the handoff flags it), and `autocomplete="one-time-code"`, which lets iOS
 * and Android offer the code straight from the SMS notification. On the
 * platforms where that fires, nobody types anything at all.
 */
export function OtpInput({
  value,
  onChange,
  invalid,
  disabled,
  describedBy,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, digit: string) {
    if (!/^\d?$/.test(digit)) return;
    const next = value.split("");
    next[index] = digit;
    onChange(next.join("").slice(0, LENGTH));
    if (digit && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  /** A pasted code fills every box and lands the caret on the last one. */
  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!digits) return;
    event.preventDefault();
    onChange(digits);
    inputs.current[Math.min(digits.length, LENGTH - 1)]?.focus();
  }

  return (
    <div
      role="group"
      aria-label="Six-digit verification code"
      className="flex justify-between gap-2.25"
    >
      {Array.from({ length: LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          value={value[index] ?? ""}
          onChange={(event) => setDigit(index, event.target.value.slice(-1))}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          onFocus={(event) => event.target.select()}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          inputMode="numeric"
          maxLength={1}
          // Only the first box carries it: browsers fill the whole group from
          // the one field that asks, and repeating it fights the autofill.
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(
            "font-tn-mono h-15 min-w-0 flex-1 rounded-[13px] border-[1.5px] bg-white text-center text-2xl font-bold text-tn-ink outline-none transition-colors",
            "focus:border-tn-ink2 disabled:opacity-60",
            "max-w-[52px]",
            invalid
              ? "border-tn-red"
              : value[index]
                ? "border-tn-red"
                : "border-tn-hair",
          )}
        />
      ))}
    </div>
  );
}
