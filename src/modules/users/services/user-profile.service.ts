import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserProfile } from 'src/modules/users/entities';
import { CreateUserProfileDto, UpdateUserProfileDto } from 'src/modules/users/common/dto';
import { Repository } from 'typeorm';
import { IUserProfile } from 'src/modules/users/common/interfaces';
import { TCreateDeceasedProfileUser } from 'src/modules/deceased/common/types';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import {
  CreateUserProfileQuery,
  GetUserProfileQuery,
  TCreateUserProfile,
  TGetUserProfile,
  TUpdateUserProfile,
  UpdateUserProfileQuery,
} from 'src/modules/users/common/types';
import { StrictOmit } from 'src/common/types';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getUserProfile(user: ITokenUserPayload): Promise<TGetUserProfile> {
    const userProfile = await findOneOrFailTyped<TGetUserProfile>(user.sub, this.userRepository, {
      select: GetUserProfileQuery.select,
      where: { id: user.sub },
      relations: GetUserProfileQuery.relations,
    });

    return userProfile;
  }

  public async createUserProfile(dto: CreateUserProfileDto, user: ITokenUserPayload): Promise<void> {
    const currentUser = await findOneOrFailTyped<TCreateUserProfile>(user.sub, this.userRepository, {
      select: CreateUserProfileQuery.select,
      where: { id: user.sub },
      relations: CreateUserProfileQuery.relations,
    });

    this.validateCreateUserProfile(currentUser);

    await this.constructAndCreateUserProfile(currentUser, dto);
  }

  public async updateUserProfile(dto: UpdateUserProfileDto, user: ITokenUserPayload): Promise<void> {
    const userProfile = await findOneOrFailTyped<TUpdateUserProfile>(user.sub, this.userProfileRepository, {
      select: UpdateUserProfileQuery.select,
      where: { user: { id: user.sub } },
    });
    await this.updateProfile(dto, userProfile);
  }

  private validateCreateUserProfile(user: TCreateUserProfile): void {
    if (user.profile) {
      throw new BadRequestException('User profile already exists');
    }
  }

  private async constructAndCreateUserProfile(
    user: TCreateDeceasedProfileUser,
    dto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    const userProfileDto = this.constructCreateUserProfileDto(dto, user);

    return await this.createProfile(userProfileDto);
  }

  private async createProfile(dto: IUserProfile): Promise<UserProfile> {
    const newUserProfile = this.userProfileRepository.create(dto);

    return await this.userProfileRepository.save(newUserProfile);
  }

  private async updateProfile(dto: UpdateUserProfileDto, existingUserProfile: TUpdateUserProfile): Promise<void> {
    const userProfileDto = this.constructUpdateUserProfileDto(dto, existingUserProfile);
    await this.userProfileRepository.update({ id: existingUserProfile.id }, userProfileDto);
  }

  private constructCreateUserProfileDto(dto: CreateUserProfileDto, user: TCreateDeceasedProfileUser): IUserProfile {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName ?? null,
      user,
    };
  }

  private constructUpdateUserProfileDto(
    dto: UpdateUserProfileDto,
    existingUserProfile: TUpdateUserProfile,
  ): StrictOmit<IUserProfile, 'user'> {
    return {
      firstName: dto.firstName ?? existingUserProfile.firstName,
      lastName: dto.lastName ?? existingUserProfile.lastName,
      middleName: dto.middleName !== undefined ? dto.middleName : existingUserProfile.middleName,
    };
  }
}
