import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { TSchema } from '@sinclair/typebox';

export const RESPONSE_SCHEMA_KEY = 'response_schema';

/**
 * A decorator that sets the response schema for a controller method.
 *
 * @param schema A JSON schema that will be used to validate the response.
 *
 * @returns A custom decorator that sets the response schema.
 */
export const SerializeResponse = (schema: TSchema): CustomDecorator => SetMetadata(RESPONSE_SCHEMA_KEY, schema);
