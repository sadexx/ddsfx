/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BadRequestException } from '@nestjs/common';

/**
 * Validates if a potentially invalid date requires user confirmation.
 *
 * Throws BadRequestException if date falls into special cases and lacks confirmation:
 * - Day 31 in months with 30 days (April, June, September, November)
 * - February 29 in non-leap years
 *
 * @param day - Day of month (1-31)
 * @param month - Month (1-12)
 * @param year - Full year (e.g., 2024)
 * @param confirmInvalidDate - User confirmation flag
 *
 * @throws {BadRequestException} When date requires confirmation but not provided
 */
export function validateDateConfirmationRequirement(
  day: number,
  month: number,
  year: number,
  confirmInvalidDate?: boolean,
): void {
  if (isDateRequiringConfirmation(day, month, year) && !confirmInvalidDate) {
    throw new BadRequestException('Invalid date requires confirmation');
  }
}

/**
 * Checks if date falls into special cases requiring user confirmation.
 *
 * @returns true if date is day 31 in 30-day month or Feb 29 in non-leap year
 */
function isDateRequiringConfirmation(day: number, month: number, year: number): boolean {
  const monthHas30Days = [4, 6, 9, 11].includes(month);
  const isFebruary = month === 2;

  if (day === 31 && monthHas30Days) {
    return true;
  }

  if (isFebruary && day === 29) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    return !isLeapYear;
  }

  return false;
}
