import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeceasedMediaContentDto, UpdateDeceasedProfileDto } from 'src/modules/deceased/common/dto';
import {
  TCreateDeceasedMediaContent,
  TCreateDeceasedProfileUser,
  TEnsureUserProfile,
  TSubscribeDeceasedProfileUser,
  TUpdateDeceasedProfile,
  TUpdateDeceasedProfileCemetery,
} from 'src/modules/deceased/common/types';
import { DeceasedQueryOptionsService } from 'src/modules/deceased/services';
import { DeceasedSubscription } from 'src/modules/deceased/entities';
import { Repository } from 'typeorm';
import { HelperService } from 'src/modules/helper/services';
import { validateBirthBeforeDeath, validateDateConfirmationRequirement } from 'src/modules/deceased/common/validators';

@Injectable()
export class DeceasedValidationService {
  constructor(
    @InjectRepository(DeceasedSubscription)
    private readonly deceasedSubscriptionRepository: Repository<DeceasedSubscription>,
    private readonly deceasedQueryOptionsService: DeceasedQueryOptionsService,
    private readonly helperService: HelperService,
  ) {}

  /**
   ** DeceasedService
   */

  public validateDeceasedProfileCreate(user: TCreateDeceasedProfileUser): void {
    this.ensureUserProfile(user);
  }

  public validateDeceasedProfileUpdate(
    dto: UpdateDeceasedProfileDto,
    deceased: TUpdateDeceasedProfile,
    cemetery: TUpdateDeceasedProfileCemetery | null,
  ): void {
    if (dto.graveLocation && !cemetery && !deceased.graveLocation) {
      throw new BadRequestException('Cannot add graveLocation without cemetery. Please provide cemeteryId.');
    }

    if (!deceased.graveLocation && cemetery && dto.graveLocation) {
      if (dto.graveLocation.latitude === undefined || dto.graveLocation.longitude === undefined) {
        throw new BadRequestException('latitude and longitude are required to create graveLocation');
      }
    }

    this.validateDeceasedDates(dto, deceased);
  }

  private validateDeceasedDates(dto: UpdateDeceasedProfileDto, deceased: TUpdateDeceasedProfile): void {
    const birthDay = dto.birthDay ?? deceased.birthDay;
    const birthMonth = dto.birthMonth ?? deceased.birthMonth;
    const birthYear = dto.birthYear ?? deceased.birthYear;

    const deathDay = dto.deathDay ?? deceased.deathDay;
    const deathMonth = dto.deathMonth ?? deceased.deathMonth;
    const deathYear = dto.deathYear ?? deceased.deathYear;

    if (dto.birthDay || dto.birthMonth || dto.birthYear) {
      if (birthDay && birthMonth && birthYear) {
        validateDateConfirmationRequirement(birthDay, birthMonth, birthYear, dto.confirmInvalidDate);
      }
    }

    if (dto.deathDay || dto.deathMonth || dto.deathYear) {
      if (deathDay && deathMonth && deathYear) {
        validateDateConfirmationRequirement(deathDay, deathMonth, deathYear, dto.confirmInvalidDate);
      }
    }

    if (dto.birthDay || dto.birthMonth || dto.birthYear || dto.deathDay || dto.deathMonth || dto.deathYear) {
      validateBirthBeforeDeath(birthYear, birthMonth, birthDay, deathYear, deathMonth, deathDay);
    }
  }

  /**
   ** DeceasedService
   */

  public async validateSubscribeDeceasedProfile(
    user: TSubscribeDeceasedProfileUser,
    deceasedId: string,
  ): Promise<void> {
    this.ensureUserProfile(user);

    const queryOptions = this.deceasedQueryOptionsService.ensureDeceasedSubscriptionOptions(user.id, deceasedId);
    const deceasedSubscriptionExists = await this.deceasedSubscriptionRepository.exists(queryOptions);

    if (deceasedSubscriptionExists) {
      throw new BadRequestException('You are already subscribed to this deceased profile');
    }
  }

  /**
   ** DeceasedMediaContentService
   */

  public async validateCreateDeceasedMediaContent(
    dto: CreateDeceasedMediaContentDto,
    deceased: TCreateDeceasedMediaContent,
  ): Promise<void> {
    const MEDIA_CONTENT_LIMIT: number = 10;

    await this.helperService.ensureFilesExist([dto]);

    if (deceased.deceasedMediaContents.length >= MEDIA_CONTENT_LIMIT) {
      throw new BadRequestException('You have reached the media content limit');
    }
  }

  /**
   ** Common Helpers
   */

  private ensureUserProfile(user: TEnsureUserProfile): void {
    if (!user.profile) {
      throw new BadRequestException('User profile is required to complete this action');
    }
  }
}
