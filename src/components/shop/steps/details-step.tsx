"use client";

import { Icon } from "@/components/tinsae/icon";
import { Chip, FieldError, SelectField, TextField } from "@/components/shop/fields";
import { FormSelect } from "@/components/tinsae/form-select";
import { formatAsTyped } from "@/lib/auth/phone";
import {
  AREAS,
  CATEGORIES,
  DAYS,
  TIMES,
  type OnboardingAction,
  type OnboardingState,
} from "@/lib/shop/onboarding-state";

export function DetailsStep({
  state,
  dispatch,
  errors,
}: {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h1 className="text-[32px] leading-tight font-extrabold tracking-[-0.03em]">Shop details</h1>
      <p className="text-tn-mute mt-3 mb-7 text-[15.5px] leading-relaxed">
        Buyers see this on your storefront and listings.
      </p>

      <div className="space-y-4.5">
        <TextField
          id="shop-name"
          label="Shop name"
          value={state.name}
          error={state.showErrors ? errors.name : undefined}
          onChange={(e) => dispatch({ type: "set", field: "name", value: e.target.value })}
          placeholder="e.g. Bole Electronics Hub"
          autoComplete="organization"
        />

        <div role="group" aria-labelledby="cats-label">
          <div className="mb-2 flex items-center justify-between">
            <span id="cats-label" className="text-tn-ink text-[13px] font-bold">
              Categories you sell
            </span>
            <span className="text-tn-mute text-xs font-semibold">{state.cats.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const selected = state.cats.includes(category);
              return (
                <Chip
                  key={category}
                  selected={selected}
                  onToggle={() => dispatch({ type: "toggle", field: "cats", value: category })}
                  className="h-10 px-4 text-[13.5px]"
                >
                  {category}
                  {selected && <Icon name="check" size={13} strokeWidth={2.4} />}
                </Chip>
              );
            })}
          </div>
          <FieldError id="cats-error">{state.showErrors ? errors.cats : undefined}</FieldError>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <SelectField
            id="shop-area"
            label="Area in Bole"
            value={state.area}
            onChange={(value) => dispatch({ type: "set", field: "area", value })}
            options={AREAS.map((area) => ({ value: area, label: `Bole · ${area}` }))}
          />

          <TextField
            id="shop-phone"
            label="Phone (buyers contact)"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="font-tn-mono"
            value={state.phone}
            error={state.showErrors ? errors.phone : undefined}
            onChange={(e) =>
              dispatch({ type: "set", field: "phone", value: formatAsTyped(e.target.value) })
            }
            placeholder="+251 91 234 5678"
          />
        </div>

        <TextField
          id="shop-address"
          label="Street address"
          hint="Optional"
          value={state.address}
          onChange={(e) => dispatch({ type: "set", field: "address", value: e.target.value })}
          placeholder="Building, street, landmark (e.g. Edna Mall 2nd Floor)"
        />

        <div role="group" aria-labelledby="hours-label">
          <span id="hours-label" className="text-tn-ink mb-2 block text-[13px] font-bold">
            Opening hours
          </span>
          <div className="mb-3 flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <Chip
                key={day}
                selected={state.days.includes(day)}
                onToggle={() => dispatch({ type: "toggle", field: "days", value: day })}
                className="size-10 justify-center rounded-xl text-[13px]"
              >
                {day}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FormSelect
                id="open-time"
                ariaLabel="Opens at"
                value={state.openTime}
                onChange={(value) => dispatch({ type: "set", field: "openTime", value })}
                options={TIMES.map((time) => ({ value: time, label: time }))}
              />
            </div>
            <span className="text-tn-mute text-sm font-semibold">to</span>
            <div className="flex-1">
              <FormSelect
                id="close-time"
                ariaLabel="Closes at"
                value={state.closeTime}
                onChange={(value) => dispatch({ type: "set", field: "closeTime", value })}
                options={TIMES.map((time) => ({ value: time, label: time }))}
              />
            </div>
          </div>
          <FieldError id="days-error">{state.showErrors ? errors.days : undefined}</FieldError>
          {/* One range across every selected day: "Sat 9–1" can't be expressed. */}
          <p className="text-tn-mute mt-2 text-[12.5px]">
            One range covers every day you picked. Per-day hours are coming later.
          </p>
        </div>
      </div>
    </div>
  );
}
