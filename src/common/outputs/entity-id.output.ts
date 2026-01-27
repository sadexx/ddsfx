import { Type } from '@sinclair/typebox';

export class EntityIdOutput {
  id: string;
  static readonly schema = Type.Object({
    id: Type.Readonly(Type.String()),
  });
}
