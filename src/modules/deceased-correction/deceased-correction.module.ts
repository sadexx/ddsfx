import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeceasedCorrection } from 'src/modules/deceased-correction/entities';
import { DeceasedCorrectionController } from 'src/modules/deceased-correction/controllers';
import { DeceasedCorrectionService } from 'src/modules/deceased-correction/services';
import { Deceased } from 'src/modules/deceased/entities';

@Module({
  imports: [TypeOrmModule.forFeature([DeceasedCorrection, Deceased])],
  controllers: [DeceasedCorrectionController],
  providers: [DeceasedCorrectionService],
  exports: [DeceasedCorrectionService],
})
export class DeceasedCorrectionModule {}
