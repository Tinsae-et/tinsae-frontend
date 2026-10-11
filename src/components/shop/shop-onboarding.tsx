"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";
import { SidePanel, Stepper } from "@/components/shop/side-panel";
import { ConfirmStep } from "@/components/shop/steps/confirm-step";
import { DetailsStep } from "@/components/shop/steps/details-step";
import { DoneStep } from "@/components/shop/steps/done-step";
import { toE164 } from "@/lib/auth/phone";
import { postAuth } from "@/lib/auth/submit";
import {
  CONFIRM,
  DETAILS,
  DONE,
  STEPS,
  clearDraft,
  errorsFor,
  initialState,
  loadDraft,
  reducer,
  saveDraft,
  shopLocation,
} from "@/lib/shop/onboarding-state";

export function ShopOnboarding({ userId }: { userId: string }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const errors = errorsFor(state);

  // The draft can only be read after mount — localStorage doesn't exist during
  // the server render, and reading it in an initialiser would make the first
  // client paint disagree with the server's and blow up hydration.
  useEffect(() => {
    dispatch({ type: "hydrate", draft: loadDraft(userId) });
  }, [userId]);

  // Save on every change once hydrated. Guarding on `hydrated` matters: without
  // it the empty initial state would overwrite the draft before it was read.
  useEffect(() => {
    if (!state.hydrated) return;
    saveDraft(userId, state);
  }, [state, userId]);

  // A submit error renders above a sticky bottom bar, which on a phone puts it
  // off-screen exactly when it is needed.
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);

  async function handleNext() {
    // Not a disabled button: pressing Continue with an incomplete form reveals
    // what's wrong rather than sitting there greyed out and silent.
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "revealErrors" });
      return;
    }

    if (state.step !== CONFIRM) {
      dispatch({ type: "advance" });
      return;
    }

    // Guarded here as well as on the button: without it a double-tap fires two
    // POSTs and creates two shops.
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    // Only name/city/phone/description have columns behind them. Address and
    // opening hours are kept in the draft until the backend can hold them —
    // see docs/registration.md §3.4.
    const res = await postAuth<{ ok: true }>("/api/auth/shop", {
      name: state.name.trim(),
      city: shopLocation(state),
      phone: toE164(state.phone),
      description: `${state.cats.join(", ")} in ${state.area.trim()}, ${state.city.trim()}.`,
    });

    setSubmitting(false);

    if (!res.ok) {
      const firstField = Object.values(res.fieldErrors)[0]?.[0];
      setError(firstField ?? res.detail ?? "Couldn't create your shop. Try again.");
      return;
    }

    // The draft has served its purpose, and leaving it behind would restore a
    // finished funnel on the next visit.
    clearDraft(userId);
    dispatch({ type: "advance" });
  }

  return (
    <div className="bg-tn-paper text-tn-ink flex min-h-screen">
      <SidePanel step={state.step} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b-tn-hair2 sticky top-0 z-10 flex h-[70px] items-center justify-between gap-4 border-b bg-white/90 px-6 backdrop-blur-md lg:px-10">
          {/* The rail is hidden below lg, so the stepper comes along to the top bar. */}
          <div className="min-w-0 lg:hidden">
            <Stepper step={state.step} compact />
          </div>
          <span className="font-tn-mono text-tn-mute hidden text-[13px] font-semibold lg:inline">
            Step {state.step + 1} of {STEPS.length}
          </span>

          <div className="flex shrink-0 items-center gap-4 text-[13.5px] font-bold">
            <Link href="/" className="text-tn-ink2 hover:text-tn-ink hidden sm:inline">
              Back to site
            </Link>
            <Link href="/dashboard" className="text-tn-red hover:text-tn-red-dark">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-tn-hair2 h-1">
          <div
            className="bg-tn-red h-full transition-[width] duration-300 ease-out"
            style={{ width: `${(state.step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex flex-1 justify-center overflow-y-auto px-6 py-10 pb-16 lg:px-10">
          <div className="w-full max-w-[560px]">
            {state.restored && state.step !== DONE ? (
              <div className="border-tn-hair mb-6 flex items-start gap-2.5 rounded-xl border bg-white p-3.5">
                <Icon name="check" size={16} className="text-tn-green mt-0.5 shrink-0" />
                <p className="text-tn-ink2 text-[13.5px] leading-relaxed">
                  We kept what you filled in last time.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      clearDraft(userId);
                      dispatch({ type: "reset" });
                    }}
                    className="text-tn-red hover:text-tn-red-dark font-bold underline underline-offset-2"
                  >
                    Start over
                  </button>
                </p>
              </div>
            ) : null}

            {error ? (
              <div
                ref={errorRef}
                role="alert"
                className="border-tn-red/30 bg-tn-red-soft text-tn-red-dark mb-6 rounded-xl border p-3.5 text-sm font-semibold"
              >
                {error}
              </div>
            ) : null}

            {state.step === DETAILS && (
              <DetailsStep state={state} dispatch={dispatch} errors={errors} />
            )}
            {state.step === CONFIRM && (
              <ConfirmStep state={state} dispatch={dispatch} errors={errors} />
            )}
            {state.step === DONE && <DoneStep state={state} />}
          </div>
        </div>

        {state.step !== DONE && (
          <div className="border-t-tn-hair2 sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t bg-white px-6 py-4.5 lg:px-10">
            <button
              type="button"
              onClick={() => dispatch({ type: "back" })}
              disabled={state.step === DETAILS}
              className="text-tn-ink2 hover:text-tn-red disabled:text-tn-mute/40 inline-flex items-center gap-1.5 text-[14.5px] font-bold transition-colors disabled:cursor-not-allowed"
            >
              <Icon name="arrow" size={15} className="rotate-180" />
              Back
            </button>

            <Pill
              kind="solid"
              size="md"
              iconAfter="arrow"
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting
                ? "Creating shop…"
                : state.step === CONFIRM
                  ? "Create my shop"
                  : "Continue"}
            </Pill>
          </div>
        )}
      </div>
    </div>
  );
}
