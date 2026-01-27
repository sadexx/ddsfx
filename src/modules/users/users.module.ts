import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  RoleService,
  UserAvatarService,
  UserContactInfoService,
  UserPasswordService,
  UserProfileService,
} from 'src/modules/users/services';
import { Role, User, UserAvatar, UserProfile, UserRole } from 'src/modules/users/entities';
import {
  UserAvatarController,
  UserContactInfoController,
  UserPasswordController,
  UserProfileController,
} from 'src/modules/users/controllers';
import { HelperModule } from 'src/modules/helper/helper.module';
import { TemporalStateModule } from 'src/libs/temporal-state/temporal-state.module';
import { OtpModule } from 'src/modules/otp/otp.module';
import { HashingModule } from 'src/libs/hashing/hashing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Role, UserProfile, UserAvatar]),
    HelperModule,
    HashingModule,
    TemporalStateModule,
    OtpModule,
  ],
  controllers: [UserProfileController, UserAvatarController, UserPasswordController, UserContactInfoController],
  providers: [RoleService, UserProfileService, UserAvatarService, UserPasswordService, UserContactInfoService],
  exports: [RoleService, UserProfileService],
})
export class UsersModule {}
