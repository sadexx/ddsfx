import { ObjectLiteral } from 'typeorm';

/**
 ** Query types
 */

export type TValidateEntitiesLimit = ObjectLiteral & { deceased: { id: string } };
