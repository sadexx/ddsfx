import { Module } from '@nestjs/common';
import { DeceasedController, DeceasedSubscriptionsController } from 'src/modules/deceased/controllers';
import {
  DeceasedQueryOptionsService,
  DeceasedService,
  DeceasedSubscriptionService,
  DeceasedValidationService,
} from 'src/modules/deceased/services';
import { CemeteryModule } from 'src/modules/cemetery/cemetery.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities';
import { Cemetery } from 'src/modules/cemetery/entities';
import { Deceased, DeceasedSubscription } from 'src/modules/deceased/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Deceased, DeceasedSubscription, User, Cemetery]), CemeteryModule],
  controllers: [DeceasedController, DeceasedSubscriptionsController],
  providers: [DeceasedService, DeceasedSubscriptionService, DeceasedQueryOptionsService, DeceasedValidationService],
  exports: [DeceasedSubscriptionService],
})
export class DeceasedModule {}
