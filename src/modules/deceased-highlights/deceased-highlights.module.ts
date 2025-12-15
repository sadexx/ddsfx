import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeceasedBiographyController,
  DeceasedEducationController,
  DeceasedEmploymentController,
  DeceasedHobbyController,
  DeceasedResidenceController,
  DeceasedSocialMediaLinkController,
} from 'src/modules/deceased-highlights/controllers';
import {
  DeceasedBiographyService,
  DeceasedEducationService,
  DeceasedEmploymentService,
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
  DeceasedHobbyService,
  DeceasedResidenceService,
  DeceasedSocialMediaLinkService,
} from 'src/modules/deceased-highlights/services';
import { DeceasedModule } from 'src/modules/deceased/deceased.module';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedBiography,
  DeceasedEducation,
  DeceasedEmployment,
  DeceasedHobby,
  DeceasedHobbyTag,
  DeceasedHobbyTagCategory,
  DeceasedResidence,
  DeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Deceased,
      DeceasedBiography,
      DeceasedEducation,
      DeceasedEmployment,
      DeceasedHobbyTagCategory,
      DeceasedHobbyTag,
      DeceasedHobby,
      DeceasedResidence,
      DeceasedSocialMediaLink,
    ]),
    DeceasedModule,
  ],
  controllers: [
    DeceasedBiographyController,
    DeceasedEducationController,
    DeceasedEmploymentController,
    DeceasedHobbyController,
    DeceasedResidenceController,
    DeceasedSocialMediaLinkController,
  ],
  providers: [
    DeceasedHighLightsQueryOptionsService,
    DeceasedHighlightsValidationService,
    DeceasedBiographyService,
    DeceasedEducationService,
    DeceasedEmploymentService,
    DeceasedHobbyService,
    DeceasedResidenceService,
    DeceasedSocialMediaLinkService,
  ],
})
export class DeceasedHighlightsModule {}
