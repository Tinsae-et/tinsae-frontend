import { validatePhone } from "@/lib/auth/phone";

/**
 * Suggestions for the city field, not a whitelist: shops anywhere in Ethiopia
 * can register, so the field takes any city typed in.
 */
export const CITIES = [
  "Addis Ababa",
  "Adama",
  "Arba Minch",
  "Asosa",
  "Bahir Dar",
  "Bishoftu",
  "Debre Birhan",
  "Debre Markos",
  "Dessie",
  "Dire Dawa",
  "Gambela",
  "Gondar",
  "Harar",
  "Hawassa",
  "Hosaena",
  "Jijiga",
  "Jimma",
  "Mekelle",
  "Nekemte",
  "Semera",
  "Shashamane",
  "Wolaita Sodo",
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const TIMES = [
  "8:00 am",
  "8:30 am",
  "9:00 am",
  "9:30 am",
  "10:00 am",
  "11:00 am",
  "12:00 pm",
  "1:00 pm",
  "6:00 pm",
  "7:00 pm",
  "8:00 pm",
  "9:00 pm",
];

/** Stepper labels. Three steps, not the design's four — see docs/registration.md §3.4. */
export const STEPS = ["Shop details", "Confirm & submit", "Done"];

export const DETAILS = 0;
export const CONFIRM = 1;
export const DONE = 2;

/**
 * Everything the funnel collects.
 *
 * Lists are arrays rather than Sets so the whole thing survives
 * JSON.stringify — the draft that gets written to localStorage is literally
 * this object.
 */
export type OnboardingState = {
  step: number;
  name: string;
  cats: string[];
  city: string;
  /** Neighbourhood within the city, e.g. "Bole" or "Piassa". */
  area: string;
  phone: string;
  address: string;
  days: string[];
  openTime: string;
  closeTime: string;
  consent: boolean;
  /** Errors stay hidden until Continue is pressed, so the form isn't shouting on first paint. */
  showErrors: boolean;
  /** False until the draft has been read; nothing is written back before then. */
  hydrated: boolean;
  /** True when a non-empty draft was picked up, so the UI can say so. */
  restored: boolean;
};

export const initialState: OnboardingState = {
  step: DETAILS,
  name: "",
  cats: [],
  city: "",
  area: "",
  phone: "",
  address: "",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  openTime: "9:00 am",
  closeTime: "8:00 pm",
  consent: false,
  showErrors: false,
  hydrated: false,
  restored: false,
};

type Field = Exclude<keyof OnboardingState, "step" | "showErrors" | "hydrated" | "restored">;

export type OnboardingAction =
  | { type: "set"; field: Field; value: string | boolean }
  | { type: "toggle"; field: "cats" | "days"; value: string }
  | { type: "back" }
  | { type: "advance" }
  | { type: "goto"; step: number }
  | { type: "revealErrors" }
  | { type: "hydrate"; draft: OnboardingState | null }
  | { type: "reset" };

/** True when a draft holds something worth telling the user was restored. */
export function isMeaningful(state: OnboardingState): boolean {
  return Boolean(state.name.trim() || state.phone.trim() || state.address.trim());
}

export function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "set":
      return { ...state, [action.field]: action.value };
    case "toggle": {
      const list = state[action.field];
      return {
        ...state,
        [action.field]: list.includes(action.value)
          ? list.filter((item) => item !== action.value)
          : [...list, action.value],
      };
    }
    case "back":
      return { ...state, step: Math.max(DETAILS, state.step - 1), showErrors: false };
    case "advance":
      return { ...state, step: Math.min(DONE, state.step + 1), showErrors: false };
    case "goto":
      return { ...state, step: action.step, showErrors: false };
    case "revealErrors":
      return { ...state, showErrors: true };
    // One dispatch rather than a handful of setState calls out of the mount
    // effect — restoring is a single transition, not three.
    case "hydrate":
      return action.draft
        ? { ...action.draft, hydrated: true, restored: isMeaningful(action.draft) }
        : { ...state, hydrated: true };
    case "reset":
      return { ...initialState, hydrated: true };
  }
}

/**
 * Validation for one step, keyed by field.
 *
 * Continue is never disabled — a disabled button that won't say what's wrong is
 * the thing this replaces. Pressing it either advances or reveals these.
 */
export function errorsFor(state: OnboardingState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (state.step === DETAILS) {
    if (!state.name.trim()) errors.name = "Your shop needs a name buyers will recognise.";
    if (state.cats.length === 0) errors.cats = "Pick at least one category.";
    if (!state.city.trim()) errors.city = "Which city is your shop in?";
    if (!state.area.trim()) errors.area = "Add the neighbourhood so buyers can find you.";
    const phoneError = validatePhone(state.phone);
    if (phoneError) errors.phone = phoneError;
    if (state.days.length === 0) errors.days = "Pick the days you're open.";
  }

  if (state.step === CONFIRM && !state.consent) {
    errors.consent = "Confirm you're authorised to represent this shop.";
  }

  return errors;
}

// ── Draft persistence ──────────────────────────────────────────────────────
//
// The funnel is filled in on a phone, often on mobile data, and losing it to a
// dropped connection or a backgrounded tab means starting over. The draft is
// kept in localStorage (not sessionStorage) so it also survives closing the tab.
//
// It holds shop details that are headed for a public storefront anyway — name,
// area, opening hours — so this is not a place sensitive data accumulates. It
// is keyed per user so a shared device doesn't hand one owner another's draft,
// and it is cleared the moment the shop is created.

const DRAFT_VERSION = 1;

function keyFor(userId: string): string {
  return `tinsae:shop-onboarding:v${DRAFT_VERSION}:${userId}`;
}

/** Every call is guarded: storage throws outright in some privacy modes. */
export function loadDraft(userId: string): OnboardingState | null {
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    // Drafts from before the city field picked an area from a Bole-only list.
    if (parsed.city === undefined && parsed.area) {
      parsed.city = "Addis Ababa";
      parsed.area = `Bole, ${parsed.area}`;
    }
    // Merge onto the defaults so a draft written by an older build — missing a
    // field this one reads — restores instead of rendering undefined.
    return { ...initialState, ...parsed, showErrors: false, hydrated: true, restored: false };
  } catch {
    return null;
  }
}

/** "City · Neighbourhood", the shape the shop's `city` column is read back in. */
export function shopLocation(state: Pick<OnboardingState, "city" | "area">): string {
  return `${state.city.trim()} · ${state.area.trim()}`;
}

export function saveDraft(userId: string, state: OnboardingState): void {
  try {
    // Never persist the success screen: resuming into "your shop is registered"
    // when it isn't would be a lie.
    if (state.step === DONE) return;
    window.localStorage.setItem(keyFor(userId), JSON.stringify(state));
  } catch {
    // Out of quota or storage disabled. The funnel still works, just without
    // resume, and there is nothing useful to tell the user here.
  }
}

export function clearDraft(userId: string): void {
  try {
    window.localStorage.removeItem(keyFor(userId));
  } catch {
    // Nothing to do.
  }
}
