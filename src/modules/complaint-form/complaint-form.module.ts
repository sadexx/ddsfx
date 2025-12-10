import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintForm } from 'src/modules/complaint-form/entities';
import { User } from 'src/modules/users/entities';
import { ComplaintFormController } from 'src/modules/complaint-form/controllers';
import { ComplaintFormService } from 'src/modules/complaint-form/services';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintForm, User])],
  controllers: [ComplaintFormController],
  providers: [ComplaintFormService],
  exports: [ComplaintFormService],
})
export class ComplaintFormModule {}
