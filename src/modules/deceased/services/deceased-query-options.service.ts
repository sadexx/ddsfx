import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { Cemetery } from 'src/modules/cemetery/entities';
import { User } from 'src/modules/users/entities';
import {
  CreateDeceasedMediaContentQuery,
  CreateDeceasedProfileCemeteryQuery,
  CreateDeceasedProfileUserQuery,
  GetDeceasedSubscriptionQuery,
  GetDeceasedSubscriptionsQuery,
  GetMyDeceasedSubscriptionsQuery,
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
      .leftJoin('deceased.deceasedMediaContents', 'deceasedMediaContent')
      .addSelect(['deceasedMediaContent.id', 'deceasedMediaContent.order'])
      .leftJoin('deceasedMediaContent.file', 'file')
      .addSelect(['file.id', 'file.fileKey'])
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

  public getMyDeceasedSubscriptionsOptions(userId: string): FindManyOptions<DeceasedSubscription> {
    return {
      select: GetMyDeceasedSubscriptionsQuery.select,
      where: { user: { id: userId } },
      relations: GetMyDeceasedSubscriptionsQuery.relations,
    };
  }

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

  public subscribeUserProfileOptions(userId: string): FindOneOptions<User> {
    return {
      select: SubscribeDeceasedProfileUserQuery.select,
      where: { id: userId },
      relations: SubscribeDeceasedProfileUserQuery.relations,
    };
  }

  public subscribeDeceasedProfileOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: SubscribeDeceasedProfileDeceasedQuery.select,
      where: { id: deceasedId },
    };
  }

  /**
   ** DeceasedMediaContentService
   */

  public createDeceasedMediaContentOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedMediaContentQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedMediaContentQuery.relations,
    };
  }

  /**
   ** DeceasedValidationService
   */

  public ensureDeceasedSubscriptionOptions(userId: string, deceasedId: string): FindOneOptions<DeceasedSubscription> {
    return {
      where: { user: { id: userId }, deceased: { id: deceasedId } },
    };
  }
}
