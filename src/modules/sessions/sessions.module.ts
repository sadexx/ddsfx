import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashingModule } from 'src/libs/hashing/hashing.module';
import { Session } from 'src/modules/sessions/entities';
import { SessionService } from 'src/modules/sessions/services';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), HashingModule],
  controllers: [],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionsModule {}
