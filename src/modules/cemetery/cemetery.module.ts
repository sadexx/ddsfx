import { Module } from '@nestjs/common';
import { CemeteryService, GraveLocationService } from 'src/modules/cemetery/services';
import { CemeteryController } from 'src/modules/cemetery/controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cemetery } from 'src/modules/cemetery/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Cemetery])],
  providers: [CemeteryService, GraveLocationService],
  controllers: [CemeteryController],
  exports: [CemeteryService, GraveLocationService],
})
export class CemeteryModule {}
