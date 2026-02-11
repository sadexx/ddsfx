import { Injectable } from '@nestjs/common';
import { EDeceasedMediaContentType } from 'src/modules/deceased/common/enums';
import { Deceased } from 'src/modules/deceased/entities';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class HelperQueryService {
  constructor() {}

  public loadDeceasedWithRelationsOptions(
    queryBuilder: SelectQueryBuilder<Deceased>,
    options?: {
      deceasedId?: string;
      cemeteryName?: string;
      isFamousPerson?: boolean;
    },
  ): void {
    const MAX_SUBSCRIPTIONS_PREVIEW: number = 3;
    const MAX_FAMOUS_PERSONS: number = 5;

    queryBuilder
      .select([
        'deceased.id',
        'deceased.originalId',
        'deceased.status',
        'deceased.isFamousPerson',
        'deceased.gender',
        'deceased.firstName',
        'deceased.lastName',
        'deceased.middleName',
        'deceased.birthDate',
        'deceased.birthDay',
        'deceased.birthMonth',
        'deceased.birthYear',
        'deceased.deathDate',
        'deceased.deathDay',
        'deceased.deathMonth',
        'deceased.deathYear',
      ])
      .leftJoin('deceased.graveLocation', 'graveLocation')
      .addSelect(['graveLocation.id', 'graveLocation.latitude', 'graveLocation.longitude', 'graveLocation.altitude'])
      .leftJoin('graveLocation.cemetery', 'cemetery')
      .addSelect(['cemetery.id', 'cemetery.name'])
      .leftJoin('cemetery.address', 'address')
      .addSelect(['address.id', 'address.region'])
      .leftJoin(
        'deceased.deceasedSubscriptions',
        'subscription',
        `subscription.id IN (
                  SELECT deceased_subscription.id 
                  FROM deceased_subscriptions deceased_subscription 
                  WHERE deceased_subscription.deceased_id = deceased.id 
                  ORDER BY deceased_subscription.creation_date DESC 
                  LIMIT :limit
              )`,
        { limit: MAX_SUBSCRIPTIONS_PREVIEW },
      )
      .addSelect(['subscription.id', 'subscription.creationDate'])
      .leftJoin('subscription.user', 'user')
      .addSelect(['user.id'])
      .leftJoin('user.avatar', 'avatar')
      .addSelect(['avatar.id'])
      .leftJoin('avatar.file', 'avatarFile')
      .addSelect(['avatarFile.id', 'avatarFile.fileKey'])
      .leftJoin(
        'deceased.deceasedMediaContents',
        'mediaContent',
        `mediaContent.id = (
                  SELECT media_content.id 
                  FROM deceased_media_contents media_content 
                  WHERE media_content.deceased_id = deceased.id 
                  AND media_content.content_type = :avatarType
                  ORDER BY media_content.order ASC 
                  LIMIT 1
              )`,
        { avatarType: EDeceasedMediaContentType.DECEASED_AVATAR },
      )
      .addSelect(['mediaContent.id', 'mediaContent.contentType', 'mediaContent.order'])
      .leftJoin('mediaContent.file', 'mediaFile')
      .addSelect(['mediaFile.id', 'mediaFile.fileKey']);

    if (options?.deceasedId) {
      queryBuilder.andWhere('deceased.id = :deceasedId', { deceasedId: options.deceasedId });
    }

    if (options?.cemeteryName) {
      queryBuilder.andWhere('cemetery.name ILIKE :cemeteryName', {
        cemeteryName: `%${options.cemeteryName}%`,
      });
    }

    if (options?.isFamousPerson === true) {
      queryBuilder.andWhere('deceased.isFamousPerson = :isFamousPerson', {
        isFamousPerson: true,
      });

      queryBuilder.orderBy('RANDOM()');
      queryBuilder.limit(MAX_FAMOUS_PERSONS);
    } else {
      queryBuilder.orderBy('subscription.creationDate', 'DESC');
    }

    queryBuilder.loadRelationCountAndMap('deceased.deceasedSubscriptionsCount', 'deceased.deceasedSubscriptions');
  }
}
