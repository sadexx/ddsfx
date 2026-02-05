import { Injectable } from '@nestjs/common';
import { CreateDeceasedProfileDto, UpdateDeceasedProfileDto } from 'src/modules/deceased/common/dto';
import { Cemetery } from 'src/modules/cemetery/entities';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { findOneOrFailTyped, findOneQueryBuilderTyped } from 'src/common/utils/find-one-typed';
import { IDeceased } from 'src/modules/deceased/common/interfaces';
import { EDeceasedStatus } from 'src/modules/deceased/common/enums';
import { CemeteryService } from 'src/modules/cemetery/services';
import { Deceased } from 'src/modules/deceased/entities';
import {
  TCreateDeceasedProfileCemetery,
  TCreateDeceasedProfileUser,
  TGetDeceasedProfile,
  TUpdateDeceasedProfile,
  TUpdateDeceasedProfileCemetery,
} from 'src/modules/deceased/common/types';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import {
  DeceasedQueryOptionsService,
  DeceasedSubscriptionService,
  DeceasedValidationService,
} from 'src/modules/deceased/services';
import { User } from 'src/modules/users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import { buildDate } from 'src/modules/deceased/common/helpers';
import { EntityIdOutput } from 'src/common/outputs';
import { OpenSearchSyncService } from 'src/modules/external-sync/services';

@Injectable()
export class DeceasedService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cemetery)
    private readonly cemeteryRepository: Repository<Cemetery>,
    private readonly deceasedQueryOptions: DeceasedQueryOptionsService,
    private readonly deceasedValidationService: DeceasedValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
    private readonly cemeteryService: CemeteryService,
    private readonly openSearchSyncService: OpenSearchSyncService,
    private readonly dataSource: DataSource,
  ) {}

  public async getDeceasedProfile(param: UUIDParamDto, user: ITokenUserPayload): Promise<TGetDeceasedProfile | null> {
    const queryBuilder = this.deceasedRepository.createQueryBuilder('deceased');
    this.deceasedQueryOptions.getDeceasedProfileOptions(queryBuilder, param.id, user.sub);
    const deceased = await findOneQueryBuilderTyped<TGetDeceasedProfile>(queryBuilder);

    return deceased;
  }

  public async createDeceasedProfile(dto: CreateDeceasedProfileDto, user: ITokenUserPayload): Promise<EntityIdOutput> {
    const { currentUser, cemetery } = await this.loadDeceasedProfileCreateEntities(user.sub, dto.cemeteryId);

    this.deceasedValidationService.validateDeceasedProfileCreate(currentUser);

    const deceased = await this.dataSource.transaction(async (manager) => {
      return await this.constructAndCreateDeceasedProfile(manager, dto, currentUser, cemetery);
    });

    return { id: deceased.id };
  }

  public async updateDeceasedProfile(
    param: UUIDParamDto,
    dto: UpdateDeceasedProfileDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);

    const { deceased, cemetery } = await this.loadDeceasedProfileUpdateEntities(param.id, dto.cemeteryId);

    this.deceasedValidationService.validateDeceasedProfileUpdate(dto, deceased, cemetery);

    await this.dataSource.transaction(async (manager) => {
      await this.updateDeceased(manager, dto, deceased, cemetery);
    });

    await this.openSearchSyncService.updateDeceasedIndex(deceased);
  }

  private async loadDeceasedProfileCreateEntities(
    userId: string,
    cemeteryId?: string,
  ): Promise<{ currentUser: TCreateDeceasedProfileUser; cemetery: TCreateDeceasedProfileCemetery | null }> {
    const queryOptions = this.deceasedQueryOptions.createDeceasedProfileOptions(userId, cemeteryId);

    const currentUser = await findOneOrFailTyped<TCreateDeceasedProfileUser>(
      userId,
      this.userRepository,
      queryOptions.user,
    );
    const cemetery = await this.loadCemeteryEntity<TCreateDeceasedProfileCemetery>(queryOptions.cemetery, cemeteryId);

    return { currentUser, cemetery };
  }

  private async loadDeceasedProfileUpdateEntities(
    deceasedId: string,
    cemeteryId?: string,
  ): Promise<{ deceased: TUpdateDeceasedProfile; cemetery: TUpdateDeceasedProfileCemetery | null }> {
    const queryOptions = this.deceasedQueryOptions.updateDeceasedProfileOptions(deceasedId, cemeteryId);

    const deceased = await findOneOrFailTyped<TUpdateDeceasedProfile>(
      deceasedId,
      this.deceasedRepository,
      queryOptions.deceased,
    );
    const cemetery = await this.loadCemeteryEntity<TUpdateDeceasedProfileCemetery>(queryOptions.cemetery, cemeteryId);

    return { deceased, cemetery };
  }

  private async loadCemeteryEntity<TReturnType>(
    queryOptions: FindOneOptions<Cemetery>,
    cemeteryId?: string,
  ): Promise<TReturnType | null> {
    return cemeteryId ? await findOneOrFailTyped<TReturnType>(cemeteryId, this.cemeteryRepository, queryOptions) : null;
  }

  private async constructAndCreateDeceasedProfile(
    manager: EntityManager,
    dto: CreateDeceasedProfileDto,
    user: TCreateDeceasedProfileUser,
    cemetery: TCreateDeceasedProfileCemetery | null,
  ): Promise<Deceased> {
    const deceasedDto = this.constructCreateDeceasedProfileDto(dto);
    const savedDeceased = await this.createDeceased(manager, deceasedDto);

    await this.deceasedSubscriptionService.constructAndCreateDeceasedSubscription(
      manager,
      dto.deceasedSubscription,
      user,
      savedDeceased,
    );

    if (cemetery) {
      await this.cemeteryService.constructAndCreateGraveLocation(manager, cemetery, savedDeceased, dto.graveLocation);
    }

    return savedDeceased;
  }

  private async createDeceased(manager: EntityManager, dto: IDeceased): Promise<Deceased> {
    const deceasedRepository = manager.getRepository(Deceased);
    const newDeceased = deceasedRepository.create(dto);

    return await deceasedRepository.save(newDeceased);
  }

  private async updateDeceased(
    manager: EntityManager,
    dto: UpdateDeceasedProfileDto,
    existingDeceased: TUpdateDeceasedProfile,
    cemetery: TUpdateDeceasedProfileCemetery | null,
  ): Promise<void> {
    const deceasedDto = this.constructUpdateDeceasedProfileDto(dto, existingDeceased);
    await manager.getRepository(Deceased).update({ id: existingDeceased.id }, deceasedDto);

    if (dto.graveLocation || dto.cemeteryId) {
      await this.cemeteryService.createOrUpdateGraveLocation(manager, existingDeceased, cemetery, dto.graveLocation);
    }
  }

  private constructCreateDeceasedProfileDto(dto: CreateDeceasedProfileDto): IDeceased {
    return {
      status: EDeceasedStatus.PENDING,
      originalId: null,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      middleName: dto.middleName ?? null,
      deathDay: dto.deathDay ?? null,
      deathMonth: dto.deathMonth ?? null,
      deathYear: dto.deathYear ?? null,
      birthDay: dto.birthDay ?? null,
      birthMonth: dto.birthMonth ?? null,
      birthYear: dto.birthYear ?? null,
      deathDate: buildDate(dto.deathYear, dto.deathMonth, dto.deathDay),
      birthDate: buildDate(dto.birthYear, dto.birthMonth, dto.birthDay),
    };
  }

  private constructUpdateDeceasedProfileDto(
    dto: UpdateDeceasedProfileDto,
    existingDeceased: TUpdateDeceasedProfile,
  ): IDeceased {
    const determinedDeathDate = buildDate(
      dto.deathYear ?? existingDeceased.deathYear,
      dto.deathMonth ?? existingDeceased.deathMonth,
      dto.deathDay ?? existingDeceased.deathDay,
    );
    const determinedBirthDate = buildDate(
      dto.birthYear ?? existingDeceased.birthYear,
      dto.birthMonth ?? existingDeceased.birthMonth,
      dto.birthDay ?? existingDeceased.birthDay,
    );

    return {
      status: existingDeceased.status,
      originalId: existingDeceased.originalId,
      firstName: dto.firstName ?? existingDeceased.firstName,
      lastName: dto.lastName ?? existingDeceased.lastName,
      middleName: dto.middleName !== undefined ? dto.middleName : existingDeceased.middleName,
      deathDay: dto.deathDay !== undefined ? dto.deathDay : existingDeceased.deathDay,
      deathMonth: dto.deathMonth !== undefined ? dto.deathMonth : existingDeceased.deathMonth,
      deathYear: dto.deathYear !== undefined ? dto.deathYear : existingDeceased.deathYear,
      birthDay: dto.birthDay !== undefined ? dto.birthDay : existingDeceased.birthDay,
      birthMonth: dto.birthMonth !== undefined ? dto.birthMonth : existingDeceased.birthMonth,
      birthYear: dto.birthYear !== undefined ? dto.birthYear : existingDeceased.birthYear,
      deathDate: determinedDeathDate,
      birthDate: determinedBirthDate,
    };
  }
}
