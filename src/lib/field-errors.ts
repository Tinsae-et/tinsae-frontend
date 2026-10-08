import { ApiError } from "./api/public";

/**
 * DRF's 400 body (`{ field: ["message", …] }`) as one message per field, so a
 * form can show each error under the input it belongs to. Non-field keys such
 * as `detail` are left for the caller's banner.
 */
export function fieldErrorsFrom(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !err.data) return {};
  const errors: Record<string, string> = {};
  for (const [field, value] of Object.entries(err.data)) {
    if (field === "detail" || field === "non_field_errors") continue;
    if (Array.isArray(value) && typeof value[0] === "string") errors[field] = value[0];
    else if (typeof value === "string") errors[field] = value;
  }
  return errors;
}

/** The banner text for a failed save: field errors point at the inputs. */
export function saveErrorMessage(err: unknown, fields: Record<string, string>, fallback: string): string {
  if (Object.keys(fields).length > 0) return "Some details need fixing — see the highlighted fields.";
  return err instanceof Error && err.message ? err.message : fallback;
}
