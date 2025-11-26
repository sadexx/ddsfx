import { Module } from '@nestjs/common';
import { Argon2HashingService, BcryptHashingService } from 'src/libs/hashing/services';

@Module({
  imports: [],
  controllers: [],
  providers: [Argon2HashingService, BcryptHashingService],
  exports: [Argon2HashingService, BcryptHashingService],
})
export class HashingModule {}
