import { EKinshipType } from 'src/modules/deceased/common/enums';
import {
  TConstructAndCreateDeceasedSubscriptionDeceased,
  TConstructAndCreateDeceasedSubscriptionUser,
} from 'src/modules/deceased/common/types';

export interface IDeceasedSubscription {
  kinshipType: EKinshipType;
  user: TConstructAndCreateDeceasedSubscriptionUser;
  deceased: TConstructAndCreateDeceasedSubscriptionDeceased;
}
