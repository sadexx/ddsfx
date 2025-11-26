import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRegistrationController, AuthController, AuthThirdPartyController } from 'src/modules/auth/controllers';
import {
  AuthRegistrationService,
  AuthCreateAccountService,
  AuthStepService,
  AuthService,
  AuthThirdPartyService,
} from 'src/modules/auth/services';
import { Role, User, UserRole } from 'src/modules/users/entities';
import { TemporalStateModule } from 'src/libs/temporal-state/temporal-state.module';
import { TokensModule } from 'src/libs/tokens/tokens.module';
import { HashingModule } from 'src/libs/hashing/hashing.module';
import { SessionsModule } from 'src/modules/sessions/sessions.module';
import { OtpModule } from 'src/modules/otp/otp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Role]),
    TemporalStateModule,
    TokensModule,
    HashingModule,
    OtpModule,
    SessionsModule,
  ],
  controllers: [AuthRegistrationController, AuthController, AuthThirdPartyController],
  providers: [AuthRegistrationService, AuthCreateAccountService, AuthStepService, AuthService, AuthThirdPartyService],
  exports: [],
})
export class AuthModule {}
