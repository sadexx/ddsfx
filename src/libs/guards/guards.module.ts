import { Global, Module } from '@nestjs/common';
import { TokensModule } from 'src/libs/tokens/tokens.module';
import { JwtFullAccessGuard, OpaqueRefreshGuard, OpqRegistrationGuard } from 'src/libs/guards/common/guards';

@Global()
@Module({
  imports: [TokensModule],
  controllers: [],
  providers: [OpqRegistrationGuard, OpaqueRefreshGuard, JwtFullAccessGuard],
  exports: [OpqRegistrationGuard, OpaqueRefreshGuard, JwtFullAccessGuard],
})
export class GuardsModule {}
