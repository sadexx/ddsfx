import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/modules/users/entities';
import { EUserRoleName } from '../common/enum';
import { Injectable } from '@nestjs/common';
import { LokiLogger } from 'src/libs/logger';

@Injectable()
export class RoleService {
  private readonly lokiLogger = new LokiLogger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  public async seedRoles(): Promise<void> {
    const existingRoles = await this.roleRepository.count();

    if (existingRoles === 0) {
      const roles = Object.values(EUserRoleName);

      for (const roleName of roles) {
        const role = this.roleRepository.create({ roleName: roleName });
        await this.roleRepository.save(role);
      }
    }

    this.lokiLogger.log(`Seeded Roles table, added record`);
  }
}
