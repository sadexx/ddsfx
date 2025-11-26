import { BadRequestException } from '@nestjs/common';
import { StringFormatOption } from '@sinclair/typebox';
import { SchemaErrorFormatter } from 'fastify/types/schema';
import { IS_LOCAL } from 'src/common/constants';
import {
  IFastifySchemaError,
  IFastifySchemaValidationError,
  IValidationErrorDetail,
} from 'src/config/common/interfaces';

/**
 * Formats Fastify schema validation errors.
 *
 * @param errors Array of AJV validation errors
 * @param dataVar The name of the data variable that was validated
 * @returns A `BadRequestException` with a formatted error response
 */
export const formatFastifySchemaErrors: SchemaErrorFormatter = (errors, dataVar) => {
  const fastifyError: IFastifySchemaError = {
    validation: errors,
    validationContext: dataVar,
  };

  const exceptionResponse = formatFastifyValidationError(fastifyError);

  return new BadRequestException(exceptionResponse);
};

/**
 * Format Fastify schema validation errors.
 *
 * The function takes an error object containing Fastify schema validation errors and
 * formats it into a more user-friendly error response.
 *
 * The error response will contain an array of user-friendly error messages and an optional
 * array of error details, which will only be included when the application is running in local
 * mode.
 *
 */
const formatFastifyValidationError = (
  error: IFastifySchemaError,
): {
  message: string[];
  details: IValidationErrorDetail[] | undefined;
} => {
  const validationErrors = error.validation.map((schemaError) => {
    const field = schemaError.instancePath.replace(/^\//, '') || error.validationContext;
    const friendlyMessage = createFriendlyMessage(field, schemaError);

    return {
      field,
      value: schemaError.data ?? 'invalid',
      message: friendlyMessage,
      constraint: schemaError.keyword,
      originalMessage: schemaError.message,
    };
  });

  const messages = [...new Set(validationErrors.map((err) => err.message))];

  return {
    message: messages,
    details: IS_LOCAL ? validationErrors : undefined,
  };
};

/**
 * Takes a Fastify validation error and returns a friendly message for the
 * end-user. The message is based on the keyword of the error and the field
 * name. If the error is not recognized, the original error message is used.
 *
 */
const createFriendlyMessage = (field: string, error: IFastifySchemaValidationError): string => {
  const fieldName = formatFieldName(field);

  switch (error.keyword) {
    case 'required': {
      const missingField = (error.params?.['missingProperty'] as string) || 'field';

      return `${missingField}: is required`;
    }

    case 'type': {
      const expectedType = (error.params['type'] as string) || 'correct type';

      return `${fieldName}: must be ${expectedType}`;
    }

    case 'format': {
      const format = error.params?.['format'] as StringFormatOption;

      return `${fieldName}: must match ${format} format`;
    }

    case 'minLength': {
      const minLength = error.params?.['limit'] as number;

      return `${fieldName}: must be at least ${minLength} characters long`;
    }

    case 'maxLength': {
      const maxLength = error.params?.['limit'] as number;

      return `${fieldName}: must be no more than ${maxLength} characters long`;
    }

    case 'minimum': {
      const minimum = error.params?.['limit'] as number;

      return `${fieldName}: must be at least ${minimum}`;
    }

    case 'maximum': {
      const maximum = error.params?.['limit'] as number;

      return `${fieldName}: must be no more than ${maximum}`;
    }

    case 'multipleOf': {
      const multipleOf = error.params?.['multipleOf'] as number;

      return `${fieldName}: must be a multiple of ${multipleOf}`;
    }

    case 'enum': {
      const allowedValues =
        (error.params as { allowedValues: string[] })?.allowedValues?.join(', ') || 'allowed values';

      return `${fieldName}: must be one of: ${allowedValues}`;
    }

    case 'const':
    case 'anyOf':
    case 'oneOf': {
      return `${fieldName}: has invalid value: ${String(error.data)}`;
    }

    case 'minItems': {
      const minItems = error.params?.['limit'] as number;

      return `${fieldName}: must contain at least ${minItems} item${minItems !== 1 ? 's' : ''}`;
    }

    case 'maxItems': {
      const maxItems = error.params?.['limit'] as number;

      return `${fieldName}: must contain no more than ${maxItems} item${maxItems !== 1 ? 's' : ''}`;
    }

    case 'uniqueItems': {
      return `${fieldName}: must contain unique items`;
    }

    case 'additionalProperties': {
      const additionalProperty = error.params?.['additionalProperty'] as string;

      return `${additionalProperty}: is not allowed`;
    }

    case 'patternProperties': {
      return `${fieldName}: property names must match the required pattern`;
    }

    case 'pattern':
      return `${fieldName}: format is invalid`;

    default:
      return `${fieldName}: ${error.message || 'is invalid'}`;
  }
};

/**
 * Converts a Fastify schema error field name to a more readable format.
 *
 * Fastify schema errors can have field names like `/foo/bar` or `/foo/0/bar`.
 * This function converts these names to more readable strings like `foo.bar` or `foo[0].bar`.
 * It also removes any leading slashes and replaces any remaining slashes with dots.
 *
 * If the field name is empty, or if it is equal to 'root', then the function returns 'field'.
 *
 */
const formatFieldName = (field: string): string => {
  if (!field || field === 'root') {
    return 'field';
  }

  return field
    .replace(/^\//, '')
    .replace(/\/(\d+)/g, '[$1]')
    .replace(/\//g, '.')
    .replace(/\.\[/g, '[');
};
