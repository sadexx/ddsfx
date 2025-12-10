import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService, UserProfileService, UserService } from 'src/modules/users/services';
import { Role, User, UserProfile, UserRole } from 'src/modules/users/entities';
import { UserController, UserProfileController } from 'src/modules/users/controllers';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Role, UserProfile])],
  controllers: [UserController, UserProfileController],
  providers: [RoleService, UserService, UserProfileService],
  exports: [RoleService, UserProfileService],
})
export class UsersModule {}
