import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService, UserService } from 'src/modules/users/services';
import { Role, User, UserRole } from 'src/modules/users/entities';
import { UserController } from 'src/modules/users/controllers';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Role])],
  controllers: [UserController],
  providers: [RoleService, UserService],
  exports: [RoleService],
})
export class UsersModule {}
