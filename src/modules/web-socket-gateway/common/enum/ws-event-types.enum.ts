import { ValuesOf } from 'src/common/types';

export const EWebSocketEventTypes = {
  EXCEPTION: 'exception',
  SEARCH_REQUEST: 'search-request',
} as const;

export type EWebSocketEventTypes = ValuesOf<typeof EWebSocketEventTypes>;
