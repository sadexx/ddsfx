import { isExists } from 'date-fns';

/**
 * Creates a Date object from year, month, and day numbers.
 *
 * @param year  - The year (e.g. 2025), can be null.
 * @param month - The month (1–12). Will be converted internally to zero-based.
 * @param day   - The day of the month (1–31), can be null.
 * @returns A Date set to midnight local time, or null if invalid/incomplete
 */
export const buildDate = (year?: number | null, month?: number | null, day?: number | null): Date | null => {
  if (year == null || month == null || day == null) {
    return null;
  }

  if (!isExists(year, month - 1, day)) {
    return null;
  }

  return new Date(year, month - 1, day);
};
