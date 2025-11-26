import { Module } from '@nestjs/common';
import { OtpLoginRepository, RegistrationRepository } from 'src/libs/temporal-state/repositories';
import { HashingModule } from 'src/libs/hashing/hashing.module';

@Module({
  imports: [HashingModule],
  controllers: [],
  providers: [RegistrationRepository, OtpLoginRepository],
  exports: [RegistrationRepository, OtpLoginRepository],
})
export class TemporalStateModule {}
