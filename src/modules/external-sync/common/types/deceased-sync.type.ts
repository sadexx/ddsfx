import { Deceased, DeceasedMediaContent, DeceasedSubscription } from 'src/modules/deceased/entities';
import { Cemetery, GraveLocation } from 'src/modules/cemetery/entities';
import { Address } from 'src/modules/address/entities';
import { User, UserAvatar } from 'src/modules/users/entities';
import { File } from 'src/libs/file-management/entities';

/**
 ** Types
 */
export type TLoadDeceasedWithRelations = Pick<
  Deceased,
  | 'id'
  | 'originalId'
  | 'firstName'
  | 'lastName'
  | 'middleName'
  | 'status'
  | 'gender'
  | 'isFamousPerson'
  | 'birthDate'
  | 'birthDay'
  | 'birthMonth'
  | 'birthYear'
  | 'deathDate'
  | 'deathDay'
  | 'deathMonth'
  | 'deathYear'
> & {
  graveLocation:
    | (Pick<GraveLocation, 'id' | 'latitude' | 'longitude' | 'altitude'> & {
        cemetery: Pick<Cemetery, 'id' | 'name'> & {
          address: Pick<Address, 'id' | 'region'>;
        };
      })
    | null;
  deceasedSubscriptions: Array<
    Pick<DeceasedSubscription, 'id' | 'creationDate'> & {
      user: Pick<User, 'id'> & {
        avatar:
          | (Pick<UserAvatar, 'id'> & {
              file: Pick<File, 'id' | 'fileKey'>;
            })
          | null;
      };
    }
  >;
  deceasedMediaContents: Array<
    Pick<DeceasedMediaContent, 'id' | 'contentType' | 'order'> & {
      file: Pick<File, 'id' | 'fileKey' | 'bucketName'>;
    }
  >;
  deceasedSubscriptionsCount: number;
};
