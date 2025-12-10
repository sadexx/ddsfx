import { BadRequestException, Injectable } from '@nestjs/common';
import { Deceased, DeceasedSubscription } from 'src/modules/deceased/entities';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateDeceasedSubscriptionDto } from 'src/modules/deceased/common/dto';
import { IDeceasedSubscription } from 'src/modules/deceased/common/interfaces';
import {
  TConstructAndCreateDeceasedSubscriptionDeceased,
  TConstructAndCreateDeceasedSubscriptionUser,
  TGetDeceasedSubscription,
  TGetDeceasedSubscriptions,
  TSubscribeDeceasedProfileDeceased,
  TSubscribeDeceasedProfileUser,
} from 'src/modules/deceased/common/types';
import { InjectRepository } from '@nestjs/typeorm';
import { DeceasedQueryOptionsService, DeceasedValidationService } from 'src/modules/deceased/services';
import { findManyAndCountTyped } from 'src/common/utils/find-many-typed';
import { PaginationQueryDto, UUIDParamDto } from 'src/common/dto';
import { PaginationOutput } from 'src/common/outputs';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { User } from 'src/modules/users/entities';

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
    private readonly dataSource: DataSource,
  ) {}

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
    const deceased = await findOneOrFailTyped<TSubscribeDeceasedProfileDeceased>(
      deceasedId,
      this.deceasedRepository,
      queryOptions.deceased,
    );

    return { currentUser, deceased };
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
