import { JWTPayload } from 'jose';

export interface IAppleJWTPayload extends JWTPayload {
  sub: string;
  nonce: string;
  c_hash: string;
  email: string;
  email_verified: string | boolean;
  is_private_email?: boolean;
  real_user_status?: number;
  auth_time: number;
  nonce_supported: boolean;
}
