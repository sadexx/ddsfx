import { EOpaqueTokenType } from 'src/libs/tokens/common/enums';

export interface IOpaqueTokenMetadata {
  type: EOpaqueTokenType;
  version: string;
  random: string;
  hmac: string;
  exp: number;
}
