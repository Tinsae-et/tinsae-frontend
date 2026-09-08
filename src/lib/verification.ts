export type VerificationState = "not_submitted" | "pending" | "approved" | "rejected";

export interface VerificationStateResponse {
  id: number | null;
  shop: number;
  state: VerificationState;
  is_verified: boolean;
  submited_at?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewer?: number | null;
  rejection_reason?: string | null;
  supporting_detail?: string;
}

export interface VerificationSubmitPayload {
  supporting_detail: string;
}

export interface VerificationFieldError {
  supporting_detail?: string[];
  detail?: string;
}

/**
 * Returns true if the shop is in a state where a new submission or resubmission is allowed.
 * A shop that is already verified or currently pending manual review cannot submit.
 */
export function canSubmitVerification(
  state: VerificationState,
  isVerified = false,
): boolean {
  if (isVerified || state === "approved" || state === "pending") {
    return false;
  }
  return state === "not_submitted" || state === "rejected";
}

/**
 * Validates the supporting_detail input on the client before network roundtrip.
 */
export function validateVerificationDetail(detail: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = detail.trim();
  if (!trimmed) {
    return {
      valid: false,
      error:
        "Please provide supporting business details, such as your TIN, trade license, or storefront location.",
    };
  }
  if (trimmed.length < 10) {
    return {
      valid: false,
      error:
        "Please provide more detail about your business (minimum 10 characters).",
    };
  }
  return { valid: true };
}

/**
 * Formats an ISO timestamp for display in the verification workflow.
 */
export function formatVerificationDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
