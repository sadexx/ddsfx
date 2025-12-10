import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateDeceasedProfileDto } from 'src/modules/deceased/common/dto';
import {
  TCreateDeceasedProfileUser,
  TEnsureUserProfile,
  TSubscribeDeceasedProfileUser,
  TUpdateDeceasedProfile,
  TUpdateDeceasedProfileCemetery,
} from 'src/modules/deceased/common/types';
import { DeceasedQueryOptionsService } from 'src/modules/deceased/services';
import { DeceasedSubscription } from 'src/modules/deceased/entities';
import { Repository } from 'typeorm';

@Injectable()
export class DeceasedValidationService {
  constructor(
    @InjectRepository(DeceasedSubscription)
    private readonly deceasedSubscriptionRepository: Repository<DeceasedSubscription>,
    private readonly deceasedQueryOptionsService: DeceasedQueryOptionsService,
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
   ** Common Helpers
   */

  private ensureUserProfile(user: TEnsureUserProfile): void {
    if (!user.profile) {
      throw new BadRequestException('User profile is required to complete this action');
    }
  }
}
