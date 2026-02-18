import { User, UserProfile } from 'src/modules/users/entities';

export const freyaUserSeedData: Partial<User> = {
  isEmailVerified: true,
  passwordHash: '',
  phoneNumber: '+3800000000000',
  isPhoneNumberVerified: true,
  registrationStrategy: 'email',
};

export const freyaUserProfileSeedData: Partial<UserProfile> = {
  firstName: 'Freya',
  lastName: ' ',
  middleName: null,
};
