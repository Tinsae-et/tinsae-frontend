"use client";

import { useState } from "react";
import { Icon } from "@/components/tinsae/icon";

const REASONS = [
  "Buyer support",
  "Shop support",
  "Report a problem",
  "Press",
  "Something else",
] as const;

export function ContactForm() {
  const [reason, setReason] = useState<(typeof REASONS)[number]>(REASONS[0]);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const contact = String(form.get("contact") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!name || !message) {
      setError("Please add your name and a message so we know how to reply.");
      return;
    }

    const body = [
      `Name: ${name}`,
      `Phone or Telegram: ${contact || "Not provided"}`,
      `Reason: ${reason}`,
      "",
      message,
    ].join("\n");

    setError("");
    setSent(true);
    window.location.href = `mailto:help@tinsae.et?subject=${encodeURIComponent(`${reason} from ${name}`)}&body=${encodeURIComponent(body)}`;
  }

  if (sent) {
    return (
      <div className="rounded-[20px] border border-tn-hair bg-[radial-gradient(120%_100%_at_50%_-20%,#E8F5EE_0%,#fff_62%)] px-6 py-14 text-center sm:px-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tn-green text-white shadow-[0_12px_30px_rgba(31,138,91,0.32)]">
          <Icon name="check" size={32} strokeWidth={3} />
        </span>
        <h2 className="mt-5 text-[25px] font-extrabold tracking-[-0.025em] text-tn-ink">
          Message ready
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-tn-mute">
          Your email draft is open. Send it from your mail app and we will reply
          within one working day, sooner on Telegram.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full border-[1.5px] border-tn-hair bg-white px-[18px] text-[13.5px] font-bold text-tn-ink transition hover:border-tn-ink"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[20px] border border-tn-hair bg-white"
    >
      <div className="border-b border-tn-hair2 px-[26px] pb-4 pt-[22px]">
        <h2 className="text-xl font-extrabold tracking-[-0.025em] text-tn-ink">
          Or write to us here
        </h2>
        <p className="mt-1.5 text-[13.5px] font-medium text-tn-mute">
          Slower than Telegram, but it works if you&apos;d rather not message.
        </p>
      </div>

      <div className="px-[26px] py-[22px] pb-6">
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-tn-red/20 bg-tn-red-soft px-3.5 py-2.5 text-xs font-semibold text-tn-red-dark"
          >
            {error}
          </p>
        )}

        <div className="grid gap-0 sm:grid-cols-2 sm:gap-3.5">
          <label className="mb-4 block text-[12.5px] font-bold text-tn-ink2 sm:mb-0">
            Your name
            <input
              name="name"
              required
              placeholder="Selam Mekonnen"
              className="mt-2 h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14.5px] font-medium text-tn-ink outline-none transition focus:border-tn-red"
            />
          </label>
          <label className="mb-4 block text-[12.5px] font-bold text-tn-ink2 sm:mb-0">
            Phone or Telegram
            <span className="float-right text-[11.5px] font-medium text-tn-mute">
              So we can reply
            </span>
            <input
              name="contact"
              placeholder="+251 91 234 5678"
              className="font-tn-mono mt-2 h-12 w-full rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 text-[14px] font-medium text-tn-ink outline-none transition focus:border-tn-red"
            />
          </label>
        </div>

        <fieldset className="mb-4">
          <legend className="mb-2 text-[12.5px] font-bold text-tn-ink2">
            What is this about?
          </legend>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((value) => {
              const selected = reason === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setReason(value)}
                  className={`inline-flex h-[38px] items-center gap-1.5 rounded-full border-[1.5px] px-[15px] text-[13px] transition ${selected ? "border-tn-red bg-tn-red-soft font-bold text-tn-red-dark" : "border-tn-hair bg-white font-semibold text-tn-ink2 hover:border-tn-ink"}`}
                >
                  {selected && (
                    <Icon
                      name="check"
                      size={13}
                      className="text-tn-red"
                      strokeWidth={3}
                    />
                  )}
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block text-[12.5px] font-bold text-tn-ink2">
          Your message
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Tell us what happened - shop name and product help us sort it faster."
            className="mt-2 min-h-32 w-full resize-y rounded-xl border-[1.5px] border-tn-hair bg-white px-3.5 py-3 text-[14px] font-medium leading-relaxed text-tn-ink outline-none transition focus:border-tn-red"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3.5">
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-tn-red px-6 text-[15px] font-bold text-white shadow-[0_8px_22px_rgba(204,48,0,0.26)] transition hover:-translate-y-px hover:bg-tn-red-dark"
          >
            <Icon name="arrow" size={17} />
            Open email draft
          </button>
          <span className="min-w-[180px] flex-1 text-xs font-medium text-tn-mute">
            We only use this to reply to you. Nothing is shared with any shop.
          </span>
        </div>
      </div>
    </form>
  );
}
