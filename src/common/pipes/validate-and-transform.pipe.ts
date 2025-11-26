import { PipeTransform, Injectable, ArgumentMetadata, Type } from '@nestjs/common';
import { ITransformableStatic } from 'src/common/interfaces';

@Injectable()
export class ValidateAndTransformPipe implements PipeTransform {
  /**
   * Transforms the value of the argument using the provided metadata.
   * If the metadata provides a validate function, it will be called with the value as an argument.
   * If the metadata provides a transform function, it will be called with the value as an argument and the result will be returned.
   * If neither a validate nor transform function is provided, the original value will be returned.
   * @param value The value to be transformed.
   * @param metadata The metadata describing the transformation.
   * @returns The transformed value.
   */
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const metatype = metadata.metatype as Type<unknown> & ITransformableStatic;

    if (metatype && typeof metatype.validate === 'function') {
      metatype.validate(value);
    }

    if (metatype && typeof metatype.transform === 'function') {
      return metatype.transform(value);
    }

    return value;
  }
}
