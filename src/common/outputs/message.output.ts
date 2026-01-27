import { Type } from '@sinclair/typebox';

export class MessageOutput {
  message: string;
  static readonly schema = Type.Object({
    message: Type.Readonly(Type.String()),
  });
}
