import { Type } from '@sinclair/typebox';

export class IMessageOutput {
  message: string;
  static readonly schema = Type.Object({
    message: Type.Readonly(Type.String()),
  });
}
