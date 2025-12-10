import { ValuesOf } from 'src/common/types';

export const EComplaintsType = {
  PROFANE_OR_OFFENSIVE_LANGUAGE: 'profane-or-offensive-language',
  FALSE_OR_MISLEADING_INFORMATION: 'false-or-misleading-information',
  DISRESPECT_TO_DECEASED: 'disrespect-to-deceased',
  PRIVACY_VIOLATION: 'privacy-violation',
  LEGAL_VIOLATION_OR_HATE_SPEECH: 'legal-violation-or-hate-speech',
  OTHER: 'other',
} as const;

export type EComplaintsType = ValuesOf<typeof EComplaintsType>;
