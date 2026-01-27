import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import {
  CreateDeceasedBiographyQuery,
  CreateDeceasedEducationsQuery,
  CreateDeceasedEmploymentsQuery,
  CreateDeceasedHobbyQuery,
  CreateDeceasedResidencesQuery,
  CreateDeceasedSocialMediaLinkQuery,
  GetDeceasedBiographiesQuery,
  GetDeceasedEducationsQuery,
  GetDeceasedEmploymentsQuery,
  GetDeceasedHobbiesQuery,
  GetDeceasedHobbyTagsQuery,
  GetDeceasedResidencesQuery,
  GetDeceasedSocialMediaLinksQuery,
  RemoveDeceasedBiographyQuery,
  RemoveDeceasedEducationQuery,
  RemoveDeceasedEmploymentQuery,
  RemoveDeceasedHobbyQuery,
  RemoveDeceasedResidenceQuery,
  RemoveDeceasedSocialMediaLinkQuery,
  UpdateDeceasedBiographyQuery,
  UpdateDeceasedEducationQuery,
  UpdateDeceasedEmploymentQuery,
  UpdateDeceasedHobbyQuery,
  UpdateDeceasedResidenceQuery,
  UpdateDeceasedSocialMediaLinkQuery,
} from 'src/modules/deceased-highlights/common/types';
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

@Injectable()
export class DeceasedHighLightsQueryOptionsService {
  /**
   ** DeceasedResidenceService
   */

  public getDeceasedResidencesOptions(deceasedId: string): FindManyOptions<DeceasedResidence> {
    return {
      select: GetDeceasedResidencesQuery.select,
      where: { deceased: { id: deceasedId } },
    };
  }

  public createDeceasedResidencesOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedResidencesQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedResidencesQuery.relations,
    };
  }

  public updateDeceasedResidenceOptions(deceasedResidenceId: string): FindOneOptions<DeceasedResidence> {
    return {
      select: UpdateDeceasedResidenceQuery.select,
      where: { id: deceasedResidenceId },
      relations: UpdateDeceasedResidenceQuery.relations,
    };
  }

  public removeDeceasedResidenceOptions(deceasedResidenceId: string): FindOneOptions<DeceasedResidence> {
    return {
      select: RemoveDeceasedResidenceQuery.select,
      where: { id: deceasedResidenceId },
      relations: RemoveDeceasedResidenceQuery.relations,
    };
  }

  /**
   ** DeceasedEducationService
   */

  public getDeceasedEducationsOptions(deceasedId: string): FindManyOptions<DeceasedEducation> {
    return {
      select: GetDeceasedEducationsQuery.select,
      where: { deceased: { id: deceasedId } },
    };
  }

  public createDeceasedEducationsOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedEducationsQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedEducationsQuery.relations,
    };
  }

  public updateDeceasedEducationOptions(deceasedEducationId: string): FindManyOptions<DeceasedEducation> {
    return {
      select: UpdateDeceasedEducationQuery.select,
      where: { id: deceasedEducationId },
      relations: UpdateDeceasedEducationQuery.relations,
    };
  }

  public removeDeceasedEducationOptions(deceasedEducationId: string): FindOneOptions<DeceasedEducation> {
    return {
      select: RemoveDeceasedEducationQuery.select,
      where: { id: deceasedEducationId },
      relations: RemoveDeceasedEducationQuery.relations,
    };
  }

  /**
   ** DeceasedEmploymentService
   */

  public getDeceasedEmploymentsOptions(deceasedId: string): FindManyOptions<DeceasedEmployment> {
    return {
      select: GetDeceasedEmploymentsQuery.select,
      where: { deceased: { id: deceasedId } },
    };
  }

  public createDeceasedEmploymentsOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedEmploymentsQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedEmploymentsQuery.relations,
    };
  }

  public updateDeceasedEmploymentOptions(deceasedEmploymentId: string): FindOneOptions<DeceasedEmployment> {
    return {
      select: UpdateDeceasedEmploymentQuery.select,
      where: { id: deceasedEmploymentId },
      relations: UpdateDeceasedEmploymentQuery.relations,
    };
  }

  public removeDeceasedEmploymentOptions(deceasedEmploymentId: string): FindOneOptions<DeceasedEmployment> {
    return {
      select: RemoveDeceasedEmploymentQuery.select,
      where: { id: deceasedEmploymentId },
      relations: RemoveDeceasedEmploymentQuery.relations,
    };
  }

  /**
   ** DeceasedHobbyService
   */

  public getDeceasedHobbiesOptions(deceasedId: string): FindManyOptions<DeceasedHobby> {
    return {
      select: GetDeceasedHobbiesQuery.select,
      where: { deceased: { id: deceasedId } },
      relations: GetDeceasedHobbiesQuery.relations,
    };
  }

  public getDeceasedHobbyTagsOptions(): FindManyOptions<DeceasedHobbyTagCategory> {
    return {
      select: GetDeceasedHobbyTagsQuery.select,
      relations: GetDeceasedHobbyTagsQuery.relations,
    };
  }

  public createDeceasedHobbyOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedHobbyQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedHobbyQuery.relations,
    };
  }

  public updateDeceasedHobbyOptions(deceasedHobbyId: string): FindOneOptions<DeceasedHobby> {
    return {
      select: UpdateDeceasedHobbyQuery.select,
      where: { id: deceasedHobbyId },
      relations: UpdateDeceasedHobbyQuery.relations,
    };
  }

  public removeDeceasedHobbyOptions(deceasedHobbyId: string): FindOneOptions<DeceasedHobby> {
    return {
      select: RemoveDeceasedHobbyQuery.select,
      where: { id: deceasedHobbyId },
      relations: RemoveDeceasedHobbyQuery.relations,
    };
  }

  /**
   ** DeceasedBiographyService
   */

  public getDeceasedBiographiesOptions(deceasedId: string): FindManyOptions<DeceasedBiography> {
    return {
      select: GetDeceasedBiographiesQuery.select,
      where: { deceased: { id: deceasedId } },
    };
  }

  public createDeceasedBiographyOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedBiographyQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedBiographyQuery.relations,
    };
  }

  public updateDeceasedBiographyOptions(deceasedBiographyId: string): FindOneOptions<DeceasedBiography> {
    return {
      select: UpdateDeceasedBiographyQuery.select,
      where: { id: deceasedBiographyId },
      relations: UpdateDeceasedBiographyQuery.relations,
    };
  }

  public removeDeceasedBiographyOptions(deceasedBiographyId: string): FindOneOptions<DeceasedBiography> {
    return {
      select: RemoveDeceasedBiographyQuery.select,
      where: { id: deceasedBiographyId },
      relations: RemoveDeceasedBiographyQuery.relations,
    };
  }

  /**
   ** DeceasedSocialMediaLinkService
   */

  public getDeceasedSocialMediaLinksOptions(deceasedId: string): FindManyOptions<DeceasedSocialMediaLink> {
    return {
      select: GetDeceasedSocialMediaLinksQuery.select,
      where: { deceased: { id: deceasedId } },
    };
  }

  public createDeceasedSocialMediaLinkOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedSocialMediaLinkQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedSocialMediaLinkQuery.relations,
    };
  }

  public updateDeceasedSocialMediaLinkOptions(
    deceasedSocialMediaLinkId: string,
  ): FindOneOptions<DeceasedSocialMediaLink> {
    return {
      select: UpdateDeceasedSocialMediaLinkQuery.select,
      where: { id: deceasedSocialMediaLinkId },
      relations: UpdateDeceasedSocialMediaLinkQuery.relations,
    };
  }

  public removeDeceasedSocialMediaLinkOptions(
    deceasedSocialMediaLinkId: string,
  ): FindOneOptions<DeceasedSocialMediaLink> {
    return {
      select: RemoveDeceasedSocialMediaLinkQuery.select,
      where: { id: deceasedSocialMediaLinkId },
      relations: RemoveDeceasedSocialMediaLinkQuery.relations,
    };
  }

  /**
   ** DeceasedHighlightsValidationService
   */

  public validateCreateDeceasedResidencesOptions(deceasedId: string): FindOneOptions<DeceasedResidence> {
    return {
      where: {
        deceased: { id: deceasedId },
        isBirthPlace: true,
      },
    };
  }

  public ensureHobbyTagsExistOptions(tagIds: string[]): FindManyOptions<DeceasedHobbyTag> {
    return {
      where: { id: In(tagIds) },
    };
  }
}
