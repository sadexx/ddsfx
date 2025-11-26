import { JWTPayload } from 'jose';

export interface IGoogleJWTPayload extends JWTPayload {
  azp?: string;
  hd?: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  at_hash?: string;
  nonce?: string;
}
