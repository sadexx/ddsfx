import { ForbiddenException, Injectable } from '@nestjs/common';
import { Deceased, DeceasedSubscription } from 'src/modules/deceased/entities';
import { Repository } from 'typeorm';
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
import { DeceasedQueryOptionsService, DeceasedValidationService } from 'src/modules/deceased/services';
import { findManyAndCountTyped, findManyTyped } from 'src/common/utils/find-many-typed';
import { PaginationQueryDto, UUIDParamDto } from 'src/common/dto';
import { PaginationOutput } from 'src/common/outputs';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { User } from 'src/modules/users/entities';
import { OpenSearchSyncService } from 'src/modules/external-sync/services';

@Injectable()
export class DeceasedSubscriptionService {
  constructor(
    @InjectRepository(DeceasedSubscription)
    private readonly deceasedSubscriptionRepository: Repository<DeceasedSubscription>,
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly deceasedQueryOptionsService: DeceasedQueryOptionsService,
    private readonly deceasedValidationService: DeceasedValidationService,
    private readonly openSearchSyncService: OpenSearchSyncService,
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

    await this.constructAndCreateDeceasedSubscription(dto, currentUser, deceased);

    await this.openSearchSyncService.updateDeceasedIndex(deceased);
  }

  private async constructAndCreateDeceasedSubscription(
    dto: CreateDeceasedSubscriptionDto,
    user: TConstructAndCreateDeceasedSubscriptionUser,
    deceased: TConstructAndCreateDeceasedSubscriptionDeceased,
  ): Promise<DeceasedSubscription> {
    const deceasedSubscriptionDto = this.constructDeceasedSubscriptionDto(dto, user, deceased);

    return await this.createDeceasedSubscription(deceasedSubscriptionDto);
  }

  public async unsubscribeDeceasedProfile(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const deceased = await this.loadDeceasedEntity(param.id);

    await this.deceasedSubscriptionRepository.delete({ deceased: { id: param.id }, user: { id: user.sub } });

    await this.openSearchSyncService.updateDeceasedIndex(deceased);
  }

  public async ensureDeceasedSubscription(userId: string, deceasedId: string): Promise<void> {
    const queryOptions = this.deceasedQueryOptionsService.ensureDeceasedSubscriptionOptions(userId, deceasedId);
    const deceasedSubscriptionExists = await this.deceasedSubscriptionRepository.exists(queryOptions);

    if (!deceasedSubscriptionExists) {
      throw new ForbiddenException('You do not have access to this deceased profile');
    }
  }

  private async loadSubscribeDeceasedProfileEntities(
    userId: string,
    deceasedId: string,
  ): Promise<{ currentUser: TSubscribeDeceasedProfileUser; deceased: TSubscribeDeceasedProfileDeceased }> {
    const queryOptions = this.deceasedQueryOptionsService.subscribeUserProfileOptions(userId);

    const currentUser = await findOneOrFailTyped<TSubscribeDeceasedProfileUser>(
      userId,
      this.userRepository,
      queryOptions,
    );
    const deceased = await this.loadDeceasedEntity(deceasedId);

    return { currentUser, deceased };
  }

  private async loadDeceasedEntity(deceasedId: string): Promise<TSubscribeDeceasedProfileDeceased> {
    const queryOptions = this.deceasedQueryOptionsService.subscribeDeceasedProfileOptions(deceasedId);

    const deceased = await findOneOrFailTyped<TSubscribeDeceasedProfileDeceased>(
      deceasedId,
      this.deceasedRepository,
      queryOptions,
    );

    return deceased;
  }

  private async createDeceasedSubscription(dto: IDeceasedSubscription): Promise<DeceasedSubscription> {
    const newDeceasedSubscription = this.deceasedSubscriptionRepository.create(dto);

    return await this.deceasedSubscriptionRepository.save(newDeceasedSubscription);
  }

  private constructDeceasedSubscriptionDto(
    dto: CreateDeceasedSubscriptionDto,
    user: TConstructAndCreateDeceasedSubscriptionUser,
    deceased: TConstructAndCreateDeceasedSubscriptionDeceased,
  ): IDeceasedSubscription {
    return {
      deceased: deceased as Deceased,
      user: user as User,
      kinshipType: dto.kinshipType,
    };
  }
}
