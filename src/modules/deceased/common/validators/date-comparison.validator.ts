import { BadRequestException } from '@nestjs/common';

/**
 * Validates that birth date is not after death date.
 *
 * Performs hierarchical date comparison:
 * 1. Compares years if both are provided
 * 2. Compares months if years are equal and both months are provided
 * 3. Compares days if years and months are equal and both days are provided
 *
 * Skips validation if any required component is missing at comparison level.
 *
 * @param birthYear - Birth year, can be null
 * @param birthMonth - Birth month (1-12), can be null
 * @param birthDay - Birth day (1-31), can be null
 * @param deathYear - Death year, can be null
 * @param deathMonth - Death month (1-12), can be null
 * @param deathDay - Death day (1-31), can be null
 * @throws {BadRequestException} When birth date component is after corresponding death date component
 */
export function validateBirthBeforeDeath(
  birthYear?: number | null,
  birthMonth?: number | null,
  birthDay?: number | null,
  deathYear?: number | null,
  deathMonth?: number | null,
  deathDay?: number | null,
): void {
  if (birthYear && deathYear) {
    if (birthYear > deathYear) {
      throw new BadRequestException('Birth year cannot be after death year');
    }

    if (birthYear === deathYear && birthMonth && deathMonth) {
      if (birthMonth > deathMonth) {
        throw new BadRequestException('Birth month cannot be after death month in the same year');
      }

      if (birthMonth === deathMonth && birthDay && deathDay) {
        if (birthDay > deathDay) {
          throw new BadRequestException('Birth day cannot be after death day in the same month');
        }
      }
    }
  }
}
