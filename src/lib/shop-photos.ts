// Shop image rules (logo and cover), mirrored from the backend's
// catalog/image_utils.py so a bad file is caught before a slow upload.

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Why this file can't be uploaded, or null when it can. */
export function photoFileError(file: { type: string; size: number }): string | null {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return "Use a JPEG, PNG or WebP image.";
  }
  if (file.size > MAX_PHOTO_BYTES) return "This photo is over 5 MB.";
  return null;
}

