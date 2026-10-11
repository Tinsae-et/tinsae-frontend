"use client";

import { Icon } from "@/components/tinsae/icon";
import { FieldError } from "@/components/shop/fields";
import {
  CONFIRM,
  shopLocation,
  type OnboardingAction,
  type OnboardingState,
} from "@/lib/shop/onboarding-state";
import { cn } from "@/lib/utils";

/**
 * The design's step 3 was a verification form: full name, role, a photo of a
 * national ID, a trade licence. None of it had anywhere to go — no upload
 * field, no storage, no review queue, and a backend where a human flips
 * `is_verified` by hand. Collecting a photo of someone's ID and dropping it is
 * worse than not asking, so this step says what actually happens instead, and
 * keeps the one thing that carries weight on its own: the attestation.
 *
 * When there is a review queue to put documents in, they get collected then.
 */
export function ConfirmStep({
  state,
  dispatch,
  errors,
}: {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  errors: Record<string, string>;
}) {
  const hours =
    state.days.length > 0 ? `${state.days.join(", ")} · ${state.openTime}–${state.closeTime}` : "—";

  return (
    <div>
      <h1 className="text-[32px] leading-tight font-extrabold tracking-[-0.03em]">
        Confirm &amp; submit
      </h1>
      <p className="text-tn-mute mt-3 mb-7 text-[15.5px] leading-relaxed">
        Check what buyers will see. You can change all of it later from your dashboard.
      </p>

      <dl className="border-tn-hair divide-tn-hair divide-y rounded-2xl border bg-white">
        <Row label="Shop name" value={state.name} />
        <Row label="Location" value={shopLocation(state)} />
        <Row label="Phone" value={state.phone} mono />
        <Row label="Categories" value={state.cats.join(", ") || "—"} />
        {state.address.trim() ? <Row label="Address" value={state.address} /> : null}
        <Row label="Opening hours" value={hours} />
      </dl>

      <button
        type="button"
        onClick={() => dispatch({ type: "goto", step: CONFIRM - 1 })}
        className="text-tn-red hover:text-tn-red-dark mt-3 text-[13.5px] font-bold"
      >
        Edit these details
      </button>

      <div className="border-tn-hair mt-7 rounded-2xl border bg-white p-5">
        <h2 className="text-tn-ink flex items-center gap-2 text-[15px] font-extrabold">
          <Icon name="shield" size={17} className="text-tn-green" />
          What happens with verification
        </h2>
        <ol className="mt-3.5 space-y-2.5">
          {[
            "Your shop goes live straight away — you can start listing products now.",
            "Our team reviews it, usually within 24 hours.",
            "You'll hear back on Telegram, and the verified badge appears on your listings.",
          ].map((line, i) => (
            <li key={line} className="text-tn-ink2 flex gap-3 text-[13.5px] leading-relaxed">
              <span className="font-tn-mono bg-tn-paper text-tn-mute mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold">
                {i + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
        <p className="text-tn-mute mt-3.5 text-[12.5px] leading-relaxed">
          If we need a trade licence or ID to finish the review, we&apos;ll ask for it on Telegram —
          never through a link sent by SMS.
        </p>
      </div>

      {/* A real checkbox: this is a legal attestation, and it was previously a
          <button> that announced as an unlabelled control. */}
      <label
        className={cn(
          "mt-5 flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
          state.consent
            ? "border-tn-green/40 bg-tn-green-soft"
            : state.showErrors && errors.consent
              ? "border-tn-red bg-white"
              : "border-tn-hair hover:border-tn-mute/40 bg-white",
        )}
      >
        <input
          type="checkbox"
          checked={state.consent}
          aria-invalid={state.showErrors && errors.consent ? true : undefined}
          aria-describedby={state.showErrors && errors.consent ? "consent-error" : undefined}
          onChange={(e) => dispatch({ type: "set", field: "consent", value: e.target.checked })}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "peer-focus-visible:ring-tn-ink mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
            state.consent ? "bg-tn-green border-tn-green text-white" : "border-tn-hair bg-white",
          )}
        >
          {state.consent && <Icon name="check" size={12} strokeWidth={3} />}
        </span>
        <span className="text-tn-ink2 text-[13.5px] leading-relaxed">
          I confirm I&apos;m authorised to represent this shop, and that the details provided are
          accurate.
        </span>
      </label>
      <FieldError id="consent-error">{state.showErrors ? errors.consent : undefined}</FieldError>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-tn-mute shrink-0 text-[12.5px] font-bold">{label}</dt>
      <dd
        className={cn(
          "text-tn-ink min-w-0 text-right text-[14px] font-semibold",
          mono && "font-tn-mono",
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
