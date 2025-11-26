import { ValuesOf } from 'src/common/types';

export const ETokenSource = {
  COOKIE: 'cookie',
  HEADER: 'header',
  BODY: 'body',
} as const;

export type ETokenSource = ValuesOf<typeof ETokenSource>;
