import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { Cemetery } from 'src/modules/cemetery/entities';
import { User } from 'src/modules/users/entities';
import {
  CreateDeceasedProfileCemeteryQuery,
  CreateDeceasedProfileUserQuery,
  GetDeceasedSubscriptionQuery,
  GetDeceasedSubscriptionsQuery,
  SubscribeDeceasedProfileDeceasedQuery,
  SubscribeDeceasedProfileUserQuery,
  UpdateDeceasedProfileCemeteryQuery,
  UpdateDeceasedProfileQuery,
} from 'src/modules/deceased/common/types';
import { Deceased, DeceasedSubscription } from 'src/modules/deceased/entities';
import { PaginationQueryDto } from 'src/common/dto';

@Injectable()
export class DeceasedQueryOptionsService {
  /**
   ** DeceasedService
   */

  public getDeceasedProfileOptions(
    queryBuilder: SelectQueryBuilder<Deceased>,
    deceasedId: string,
    userId: string,
  ): void {
    queryBuilder
      .select([
        'deceased.id',
        'deceased.biography',
        'deceased.firstName',
        'deceased.lastName',
        'deceased.middleName',
        'deceased.deathDay',
        'deceased.deathMonth',
        'deceased.deathYear',
        'deceased.birthDay',
        'deceased.birthMonth',
        'deceased.birthYear',
        'deceased.status',
      ])
      .leftJoin('deceased.graveLocation', 'graveLocation')
      .addSelect(['graveLocation.id', 'graveLocation.latitude', 'graveLocation.longitude', 'graveLocation.altitude'])
      .leftJoin('graveLocation.cemetery', 'cemetery')
      .addSelect(['cemetery.id', 'cemetery.name'])
      .leftJoin('deceased.deceasedSubscriptions', 'subscription', 'subscription.user_id = :userId', { userId })
      .addSelect(['subscription.id'])
      .where('deceased.id = :deceasedId', { deceasedId });
  }

  public createDeceasedProfileOptions(
    userId: string,
    cemeteryId?: string,
  ): { user: FindOneOptions<User>; cemetery: FindOneOptions<Cemetery> } {
    return {
      user: {
        select: CreateDeceasedProfileUserQuery.select,
        where: { id: userId },
        relations: CreateDeceasedProfileUserQuery.relations,
      },
      cemetery: {
        select: CreateDeceasedProfileCemeteryQuery.select,
        where: { id: cemeteryId },
      },
    };
  }

  public updateDeceasedProfileOptions(
    deceasedId: string,
    cemeteryId?: string,
  ): { deceased: FindOneOptions<Deceased>; cemetery: FindOneOptions<Cemetery> } {
    return {
      deceased: {
        select: UpdateDeceasedProfileQuery.select,
        where: { id: deceasedId },
        relations: UpdateDeceasedProfileQuery.relations,
      },
      cemetery: {
        select: UpdateDeceasedProfileCemeteryQuery.select,
        where: { id: cemeteryId },
      },
    };
  }

  /**
   ** DeceasedSubscriptionService
   */

  public getDeceasedSubscriptionsOptions(
    dto: PaginationQueryDto,
    deceasedId: string,
  ): FindManyOptions<DeceasedSubscription> {
    return {
      select: GetDeceasedSubscriptionsQuery.select,
      where: { deceased: { id: deceasedId } },
      relations: GetDeceasedSubscriptionsQuery.relations,
      order: { creationDate: dto.sortOrder },
      take: dto.limit,
      skip: dto.offset,
    };
  }

  public getDeceasedSubscriptionOptions(subscriptionId: string): FindOneOptions<DeceasedSubscription> {
    return {
      select: GetDeceasedSubscriptionQuery.select,
      where: { id: subscriptionId },
      relations: GetDeceasedSubscriptionQuery.relations,
    };
  }

  public subscribeDeceasedProfileOptions(
    userId: string,
    deceasedId: string,
  ): { user: FindOneOptions<User>; deceased: FindOneOptions<Deceased> } {
    return {
      user: {
        select: SubscribeDeceasedProfileUserQuery.select,
        where: { id: userId },
        relations: SubscribeDeceasedProfileUserQuery.relations,
      },
      deceased: {
        select: SubscribeDeceasedProfileDeceasedQuery.select,
        where: { id: deceasedId },
      },
    };
  }

  public ensureDeceasedSubscriptionOptions(userId: string, deceasedId: string): FindOneOptions<DeceasedSubscription> {
    return {
      where: { user: { id: userId }, deceased: { id: deceasedId } },
    };
  }
}
