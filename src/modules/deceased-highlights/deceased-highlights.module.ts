import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeceasedBiographyController,
  DeceasedEducationController,
  DeceasedResidenceController,
  DeceasedSocialMediaLinkController,
} from 'src/modules/deceased-highlights/controllers';
import {
  DeceasedBiographyService,
  DeceasedEducationService,
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
  DeceasedResidenceService,
  DeceasedSocialMediaLinkService,
} from 'src/modules/deceased-highlights/services';
import { DeceasedModule } from 'src/modules/deceased/deceased.module';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedBiography,
  DeceasedPlaceEntry,
  DeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/entities';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deceased, DeceasedBiography, DeceasedPlaceEntry, DeceasedSocialMediaLink]),
    DeceasedModule,
    HelperModule,
  ],
  controllers: [
    DeceasedBiographyController,
    DeceasedEducationController,
    DeceasedResidenceController,
    DeceasedSocialMediaLinkController,
  ],
  providers: [
    DeceasedHighLightsQueryOptionsService,
    DeceasedHighlightsValidationService,
    DeceasedBiographyService,
    DeceasedEducationService,
    DeceasedResidenceService,
    DeceasedSocialMediaLinkService,
  ],
})
export class DeceasedHighlightsModule {}
