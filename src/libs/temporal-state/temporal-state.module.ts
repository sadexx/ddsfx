import { Module } from '@nestjs/common';
import {
  OtpLoginRepository,
  RegistrationRepository,
  UserContactInfoRepository,
} from 'src/libs/temporal-state/repositories';
import { HashingModule } from 'src/libs/hashing/hashing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HashingModule],
  controllers: [],
  providers: [RegistrationRepository, OtpLoginRepository, UserContactInfoRepository],
  exports: [RegistrationRepository, OtpLoginRepository, UserContactInfoRepository],
})
export class TemporalStateModule {}
