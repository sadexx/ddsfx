import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NotEmptyBodyPipe<T = Record<string, unknown>> implements PipeTransform<T, T> {
  /**
   * Validate if the request body is a non-empty object.
   * Throw BadRequestException if the request body is not a non-empty object.
   * @param value The request body to be validated.
   * @returns The validated request body.
   * @throws BadRequestException If the request body is not a non-empty object.
   */
  transform(value: T): T {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('The request body must be a non-empty object');
    }

    const objectKeys = Object.keys(value);

    if (objectKeys.length === 0 || Object.values(value).every((val) => val === undefined)) {
      throw new BadRequestException('The request body must be a non-empty object');
    }

    return value;
  }
}
