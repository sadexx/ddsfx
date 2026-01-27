import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UrlPattern, UUIDPattern } from 'src/common/validators';

export class CreateContactMethodDto {
  description: string;
  url: string;
  fileId: string;

  static readonly schema = Type.Object(
    { description: StandardStringPattern, url: UrlPattern, fileId: UUIDPattern },
    { additionalProperties: false },
  );
}
