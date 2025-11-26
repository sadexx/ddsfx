import { ArgumentMetadata, Injectable, PipeTransform, Type } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { TSchema } from '@sinclair/typebox';
import { ValueError } from '@sinclair/typebox/errors';
import { Value } from '@sinclair/typebox/value';
import { ITransformableStatic } from 'src/common/interfaces';

@Injectable()
export class WsValidationPipe implements PipeTransform {
  constructor(private schema: TSchema) {}

  /**
   * Validate and transform the value of the argument using the provided metadata.
   * If the metadata provides a validate function, it will be called with the value as an argument.
   * If the metadata provides a transform function, it will be called with the value as an argument and the result will be returned.
   * If neither a validate nor transform function is provided, the original value will be returned.
   * @param value The value to be transformed.
   * @param metadata The metadata describing the transformation.
   * @returns The transformed value.
   * @throws WsException If the value does not conform to the provided schema.
   */
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const metatype = metadata.metatype as Type<unknown> & ITransformableStatic;

    if (!Value.Check(this.schema, value)) {
      const errors: ValueError[] = [...Value.Errors(this.schema, value)];
      const formattedErrors = this.formatTypeBoxErrorMessages(errors, metadata);

      throw new WsException(formattedErrors);
    }

    if (metatype && typeof metatype.validate === 'function') {
      metatype.validate(value);
    }

    if (metatype && typeof metatype.transform === 'function') {
      return metatype.transform(value);
    }

    return value;
  }

  /**
   * Formats the error messages of a typebox validation error
   * @param errors The typebox validation errors
   * @param metadata The metadata of the argument
   * @returns An array of formatted error messages
   */
  private formatTypeBoxErrorMessages(errors: ValueError[], metadata: ArgumentMetadata): string[] {
    return errors.map((error) => {
      const field = error.path.replace(/^\//, '') || metadata.type;

      return `${field}: ${error.message}`;
    });
  }
}
