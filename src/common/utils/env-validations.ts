import { envStringToBoolean } from 'src/common/utils';
import { TTransformations, TValidatorFactory, TValidators } from 'src/config/common/types';

export const transforms = {
  string: (value: string): string => value,
  number: (value: string): number => Number(value),
  boolean: (value: string): boolean => envStringToBoolean(value),
  enum: <T extends string>(value: string): T => value as T,
} as const satisfies TTransformations;

export const validators = {
  requiredString: (value: string, fieldName: string): void => {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName} is required and cannot be empty`);
    }
  },

  optionalString: (value: string | undefined, fieldName: string): void => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
      }
    }
  },

  numericString: (value: string, fieldName: string): void => {
    if (!/^\d+$/.test(value)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
  },

  boolean: (value: string, fieldName: string): void => {
    if (!['true', 'false'].includes(value)) {
      throw new Error(`${fieldName} must be either "true" or "false"`);
    }
  },
} as const satisfies TValidators;

export const validatorFactories = {
  oneOf:
    (validValues: string[], fieldName: string) =>
    (value: string): void => {
      if (!validValues.includes(value)) {
        throw new Error(`${fieldName} must be one of: ${validValues.join(', ')}`);
      }
    },
} as const satisfies TValidatorFactory;
