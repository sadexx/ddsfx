import { Module } from '@nestjs/common';
import {
  DeceasedController,
  DeceasedMediaContentController,
  DeceasedSubscriptionsController,
} from 'src/modules/deceased/controllers';
import {
  DeceasedMediaContentService,
  DeceasedQueryOptionsService,
  DeceasedService,
  DeceasedSubscriptionService,
  DeceasedValidationService,
} from 'src/modules/deceased/services';
import { CemeteryModule } from 'src/modules/cemetery/cemetery.module';
import { ExternalSyncModule } from 'src/modules/external-sync/external-sync.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities';
import { Cemetery } from 'src/modules/cemetery/entities';
import { Deceased, DeceasedMediaContent, DeceasedSubscription } from 'src/modules/deceased/entities';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deceased, DeceasedSubscription, User, Cemetery, DeceasedMediaContent]),
    ExternalSyncModule,
    CemeteryModule,
    HelperModule,
  ],
  controllers: [DeceasedController, DeceasedSubscriptionsController, DeceasedMediaContentController],
  providers: [
    DeceasedService,
    DeceasedSubscriptionService,
    DeceasedQueryOptionsService,
    DeceasedValidationService,
    DeceasedMediaContentService,
  ],
  exports: [DeceasedSubscriptionService],
})
export class DeceasedModule {}
