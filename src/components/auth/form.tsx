"use client";

import { Icon } from "@/components/tinsae/icon";
import { cn } from "@/lib/utils";

/**
 * One labelled input with its inline errors.
 *
 * The label is a real <label htmlFor>, the errors are wired through
 * aria-describedby, and the field carries aria-invalid — so the error is
 * announced rather than just coloured. Errors arrive as an array because
 * Django's password validators return several at once.
 */
export function Field({
  id,
  label,
  errors,
  hint,
  prefix,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "prefix"> & {
  id: string;
  label: string;
  errors?: string[];
  hint?: string;
  prefix?: React.ReactNode;
}) {
  const invalid = Boolean(errors?.length);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12.5px] font-bold text-tn-ink2"
      >
        {label}
      </label>

      <div
        className={cn(
          "mt-1.75 flex h-13 items-center overflow-hidden rounded-[13px] border-[1.5px] bg-white transition-colors",
          "focus-within:border-tn-ink2",
          invalid ? "border-tn-red" : "border-tn-hair",
        )}
      >
        {prefix}
        <input
          id={id}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : hint ? hintId : undefined}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-tn-ink outline-none placeholder:text-tn-mute/70",
            className,
          )}
          {...props}
        />
      </div>

      {invalid ? (
        <ul id={errorId} className="mt-1.5 space-y-0.5">
          {errors?.map((error) => (
            <li key={error} className="text-[12px] leading-[1.4] text-tn-red">
              {error}
            </li>
          ))}
        </ul>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[12px] text-tn-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** The fixed +251 block inside the phone field. Only Ethiopia is supported. */
export function PhonePrefix() {
  return (
    <span className="flex h-full items-center gap-1.75 border-r border-tn-hair bg-tn-paper px-3.25 text-[14.5px] font-bold text-tn-ink">
      <span aria-hidden className="text-[15px]">
        🇪🇹
      </span>
      +251
    </span>
  );
}

/**
 * Full-width 52px primary action.
 *
 * Disabled while pending — the handoff calls out that the prototype has no
 * pending state, and a double-submitted registration is a duplicate-username
 * 400 the user did not earn.
 */
export function SubmitButton({
  pending,
  children,
  ...props
}: React.ComponentProps<"button"> & { pending?: boolean }) {
  // Both of these are applied *after* the prop spread below: `disabled` is
  // computed from the caller's value and the pending flag together, and a
  // spread `disabled={false}` would otherwise re-enable a button mid-request.
  const isDisabled = pending || props.disabled;
  const type = props.type ?? "submit";

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      className="inline-flex h-13 w-full items-center justify-center gap-2.25 rounded-[13px] bg-tn-red text-[15px] font-bold text-white shadow-[0_8px_22px_rgba(204,48,0,0.24)] transition-colors hover:bg-tn-red-dark disabled:cursor-not-allowed disabled:bg-[#E6C9BD] disabled:shadow-none"
    >
      {pending ? (
        <>
          <Spinner />
          Working…
        </>
      ) : (
        <>
          {children}
          <Icon name="arrow" size={17} />
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

/** Non-field errors: bad credentials, throttling, an unreachable backend. */
export function FormNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mb-4 rounded-[11px] border-[1.5px] border-tn-red/25 bg-tn-red-soft px-3.5 py-2.75 text-[13px] leading-[1.45] text-tn-red"
    >
      {children}
    </p>
  );
}
