import { Module } from '@nestjs/common';
import { CemeteryQueryOptionsService, CemeteryService } from 'src/modules/cemetery/services';
import { CemeteryController } from 'src/modules/cemetery/controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cemetery } from 'src/modules/cemetery/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Cemetery])],
  providers: [CemeteryService, CemeteryQueryOptionsService],
  controllers: [CemeteryController],
  exports: [CemeteryService],
})
export class CemeteryModule {}
