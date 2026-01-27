import { BadRequestException, Injectable } from '@nestjs/common';
import { Deceased, DeceasedSubscription } from 'src/modules/deceased/entities';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateDeceasedSubscriptionDto } from 'src/modules/deceased/common/dto';
import { IDeceasedSubscription } from 'src/modules/deceased/common/interfaces';
import {
  TConstructAndCreateDeceasedSubscriptionDeceased,
  TConstructAndCreateDeceasedSubscriptionUser,
  TGetDeceasedSubscription,
  TGetDeceasedSubscriptions,
  TGetMyDeceasedSubscriptions,
  TSubscribeDeceasedProfileDeceased,
  TSubscribeDeceasedProfileUser,
} from 'src/modules/deceased/common/types';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeceasedQueryOptionsService,
  DeceasedSyncService,
  DeceasedValidationService,
} from 'src/modules/deceased/services';
import { findManyAndCountTyped, findManyTyped } from 'src/common/utils/find-many-typed';
import { PaginationQueryDto, UUIDParamDto } from 'src/common/dto';
import { PaginationOutput } from 'src/common/outputs';
import { findOneOrFailTyped, findOneTyped } from 'src/common/utils/find-one-typed';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { User } from 'src/modules/users/entities';
import { LokiLogger } from 'src/libs/logger';

@Injectable()
export class DeceasedSubscriptionService {
  private readonly lokiLogger = new LokiLogger(DeceasedSubscriptionService.name);
  constructor(
    @InjectRepository(DeceasedSubscription)
    private readonly deceasedSubscriptionRepository: Repository<DeceasedSubscription>,
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly deceasedQueryOptionsService: DeceasedQueryOptionsService,
    private readonly deceasedValidationService: DeceasedValidationService,
    private readonly deceasedSyncService: DeceasedSyncService,
    private readonly dataSource: DataSource,
  ) {}

  public async getMyDeceasedSubscriptions(user: ITokenUserPayload): Promise<TGetMyDeceasedSubscriptions[]> {
    const queryOptions = this.deceasedQueryOptionsService.getMyDeceasedSubscriptionsOptions(user.sub);
    const deceasedSubscriptions = await findManyTyped<TGetMyDeceasedSubscriptions[]>(
      this.deceasedSubscriptionRepository,
      queryOptions,
    );

    return deceasedSubscriptions;
  }

  public async getDeceasedSubscriptions(
    param: UUIDParamDto,
    dto: PaginationQueryDto,
  ): Promise<PaginationOutput<TGetDeceasedSubscriptions>> {
    const queryOptions = this.deceasedQueryOptionsService.getDeceasedSubscriptionsOptions(dto, param.id);
    const [deceasedSubscriptions, count] = await findManyAndCountTyped<TGetDeceasedSubscriptions[]>(
      this.deceasedSubscriptionRepository,
      queryOptions,
    );

    return { data: deceasedSubscriptions, total: count, limit: dto.limit, offset: dto.offset };
  }

  public async getDeceasedSubscription(param: UUIDParamDto): Promise<TGetDeceasedSubscription> {
    const queryOptions = this.deceasedQueryOptionsService.getDeceasedSubscriptionOptions(param.id);
    const deceasedSubscription = await findOneOrFailTyped<TGetDeceasedSubscription>(
      param.id,
      this.deceasedSubscriptionRepository,
      queryOptions,
    );

    return deceasedSubscription;
  }

  public async subscribeDeceasedProfile(
    param: UUIDParamDto,
    dto: CreateDeceasedSubscriptionDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const { currentUser, deceased } = await this.loadSubscribeDeceasedProfileEntities(user.sub, param.id);

    await this.deceasedValidationService.validateSubscribeDeceasedProfile(currentUser, param.id);

    await this.dataSource.transaction(async (manager) => {
      await this.constructAndCreateDeceasedSubscription(manager, dto, currentUser, deceased);
    });

    await this.deceasedSyncService.updateDeceasedIndex(deceased.id);
  }

  public async constructAndCreateDeceasedSubscription(
    manager: EntityManager,
    dto: CreateDeceasedSubscriptionDto,
    user: TConstructAndCreateDeceasedSubscriptionUser,
    deceased: TConstructAndCreateDeceasedSubscriptionDeceased,
  ): Promise<DeceasedSubscription> {
    const deceasedSubscriptionDto = this.constructDeceasedSubscriptionDto(dto, user, deceased);

    return await this.createDeceasedSubscription(manager, deceasedSubscriptionDto);
  }

  public async unsubscribeDeceasedProfile(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    await this.deceasedSubscriptionRepository.delete({ deceased: { id: param.id }, user: { id: user.sub } });
    await this.deceasedSyncService.updateDeceasedIndex(param.id);
  }

  public async ensureDeceasedSubscription(userId: string, deceasedId: string): Promise<void> {
    const queryOptions = this.deceasedQueryOptionsService.ensureDeceasedSubscriptionOptions(userId, deceasedId);
    const deceasedSubscriptionExists = await this.deceasedSubscriptionRepository.exists(queryOptions);

    if (!deceasedSubscriptionExists) {
      throw new BadRequestException('You do not have access to this deceased profile');
    }
  }

  private async loadSubscribeDeceasedProfileEntities(
    userId: string,
    deceasedId: string,
  ): Promise<{ currentUser: TSubscribeDeceasedProfileUser; deceased: TSubscribeDeceasedProfileDeceased }> {
    const queryOptions = this.deceasedQueryOptionsService.subscribeDeceasedProfileOptions(userId, deceasedId);

    const currentUser = await findOneOrFailTyped<TSubscribeDeceasedProfileUser>(
      deceasedId,
      this.userRepository,
      queryOptions.user,
    );
    const deceased = await this.loadDeceasedEntity(deceasedId, queryOptions.deceased);

    return { currentUser, deceased };
  }

  private async loadDeceasedEntity(
    deceasedId: string,
    queryOptions: FindOneOptions<Deceased>,
  ): Promise<TSubscribeDeceasedProfileDeceased> {
    let deceased = await findOneTyped<TSubscribeDeceasedProfileDeceased>(this.deceasedRepository, queryOptions);

    if (!deceased) {
      this.lokiLogger.log(`Deceased ${deceasedId} not found in city, fetching from OS`);
      deceased = await this.deceasedSyncService.createDeceasedFromIndex(deceasedId);
    }

    return deceased;
  }

  private async createDeceasedSubscription(
    manager: EntityManager,
    dto: IDeceasedSubscription,
  ): Promise<DeceasedSubscription> {
    const deceasedSubscriptionRepository = manager.getRepository(DeceasedSubscription);
    const newDeceasedSubscription = deceasedSubscriptionRepository.create(dto);

    return await deceasedSubscriptionRepository.save(newDeceasedSubscription);
  }

  private constructDeceasedSubscriptionDto(
    dto: CreateDeceasedSubscriptionDto,
    user: TConstructAndCreateDeceasedSubscriptionUser,
    deceased: TConstructAndCreateDeceasedSubscriptionDeceased,
  ): IDeceasedSubscription {
    return {
      kinshipType: dto.kinshipType,
      deceased,
      user,
    };
  }
}
