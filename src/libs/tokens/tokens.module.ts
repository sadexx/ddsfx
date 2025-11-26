import { Global, Module } from '@nestjs/common';
import {
  AppleTokenService,
  GoogleTokenService,
  JoseTokenService,
  OpaqueTokenService,
  TokenExtractorService,
  TokenService,
} from 'src/libs/tokens/services';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    JoseTokenService,
    OpaqueTokenService,
    TokenExtractorService,
    TokenService,
    AppleTokenService,
    GoogleTokenService,
  ],
  exports: [TokenService],
})
export class TokensModule {}
