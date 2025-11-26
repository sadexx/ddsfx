import { IOpaqueTokenMetadata } from 'src/libs/tokens/common/interfaces/opq-token-metadata.interface';

export interface IOpaqueTokenData extends IOpaqueTokenMetadata {
  token: string;
}
