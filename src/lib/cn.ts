/**
 * Minimal className joiner — filters falsy values and joins with spaces.
 * Avoids pulling in clsx/tailwind-merge for a demo (PRD: no unnecessary deps).
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
