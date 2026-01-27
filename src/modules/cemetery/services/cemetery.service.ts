import { Injectable } from '@nestjs/common';
import { Cemetery, GraveLocation } from 'src/modules/cemetery/entities';
import { EntityManager, Repository } from 'typeorm';
import { CreateGraveLocationDto, GetCemeteriesDto, UpdateGraveLocationDto } from 'src/modules/cemetery/common/dto';
import { IGraveLocation } from 'src/modules/cemetery/common/interfaces';
import {
  TCreateDeceasedProfileCemetery,
  TUpdateDeceasedProfile,
  TUpdateDeceasedProfileCemetery,
} from 'src/modules/deceased/common/types';
import { StrictOmit } from 'src/common/types';
import { TConstructGraveLocationDtoDeceased, TGetCemeteries } from 'src/modules/cemetery/common/types';
import { InjectRepository } from '@nestjs/typeorm';
import { CemeteryQueryOptionsService } from 'src/modules/cemetery/services';
import { PaginationOutput } from 'src/common/outputs';
import { findManyAndCountQueryBuilderTyped } from 'src/common/utils/find-many-typed';
import { cemeteriesSeedData } from 'src/modules/cemetery/common/seed-data';
import { LokiLogger } from 'src/libs/logger';

@Injectable()
export class CemeteryService {
  private readonly lokiLogger = new LokiLogger(CemeteryService.name);
  constructor(
    @InjectRepository(Cemetery)
    private readonly cemeteryRepository: Repository<Cemetery>,
    private readonly cemeteryQueryOptionsService: CemeteryQueryOptionsService,
  ) {}

  public async seedCemeteries(): Promise<void> {
    const existingCemeteries = await this.cemeteryRepository.count();

    if (existingCemeteries === 0) {
      await this.cemeteryRepository.save(cemeteriesSeedData);
      this.lokiLogger.log(`Seeded Cemeteries table, added record for ${cemeteriesSeedData.length} cemeteries`);
    }
  }

  public async getCemeteries(dto: GetCemeteriesDto): Promise<PaginationOutput<TGetCemeteries>> {
    const queryBuilder = this.cemeteryRepository.createQueryBuilder('cemetery');
    this.cemeteryQueryOptionsService.getCemeteriesOptions(queryBuilder, dto);
    const [cemeteries, count] = await findManyAndCountQueryBuilderTyped<TGetCemeteries[]>(queryBuilder);

    return { data: cemeteries, total: count, limit: dto.limit, offset: dto.offset };
  }

  public async createOrUpdateGraveLocation(
    manager: EntityManager,
    deceased: TUpdateDeceasedProfile,
    cemetery: TUpdateDeceasedProfileCemetery | null,
    dto?: UpdateGraveLocationDto,
  ): Promise<void> {
    if (!deceased.graveLocation && cemetery) {
      await this.constructAndCreateGraveLocation(manager, cemetery, deceased, dto);
    } else if (deceased.graveLocation && (dto || cemetery)) {
      await this.updateGraveLocation(manager, deceased.graveLocation, cemetery, dto);
    }
  }

  public async constructAndCreateGraveLocation(
    manager: EntityManager,
    cemetery: TCreateDeceasedProfileCemetery,
    deceased: TConstructGraveLocationDtoDeceased,
    dto?: CreateGraveLocationDto | UpdateGraveLocationDto,
  ): Promise<GraveLocation> {
    const graveLocationDto = this.constructCreateGraveLocationDto(cemetery, deceased, dto);

    return await this.createGraveLocation(manager, graveLocationDto);
  }

  private async createGraveLocation(manager: EntityManager, dto: IGraveLocation): Promise<GraveLocation> {
    const graveLocationRepository = manager.getRepository(GraveLocation);
    const newGraveLocation = graveLocationRepository.create(dto);

    return await graveLocationRepository.save(newGraveLocation);
  }

  private async updateGraveLocation(
    manager: EntityManager,
    existingGraveLocation: NonNullable<TUpdateDeceasedProfile['graveLocation']>,
    cemetery: TUpdateDeceasedProfileCemetery | null,
    dto?: UpdateGraveLocationDto,
  ): Promise<void> {
    const graveLocationDto = this.constructUpdateGraveLocationDto(existingGraveLocation, cemetery, dto);

    await manager.getRepository(GraveLocation).update({ id: existingGraveLocation.id }, graveLocationDto);
  }

  private constructCreateGraveLocationDto(
    cemetery: TCreateDeceasedProfileCemetery,
    deceased: TConstructGraveLocationDtoDeceased,
    dto?: CreateGraveLocationDto | UpdateGraveLocationDto,
  ): IGraveLocation {
    return {
      latitude: dto?.latitude ?? null,
      longitude: dto?.longitude ?? null,
      altitude: dto?.altitude ?? null,
      cemetery,
      deceased,
    };
  }

  private constructUpdateGraveLocationDto(
    existingGraveLocation: NonNullable<TUpdateDeceasedProfile['graveLocation']>,
    cemetery: TUpdateDeceasedProfileCemetery | null,
    dto?: UpdateGraveLocationDto,
  ): StrictOmit<IGraveLocation, 'deceased'> {
    const cemeteryChanged = cemetery && cemetery.id !== existingGraveLocation.cemetery.id;

    return {
      latitude: dto?.latitude !== undefined ? dto.latitude : cemeteryChanged ? null : existingGraveLocation.latitude,
      longitude:
        dto?.longitude !== undefined ? dto.longitude : cemeteryChanged ? null : existingGraveLocation.longitude,
      altitude: dto?.altitude !== undefined ? dto.altitude : cemeteryChanged ? null : existingGraveLocation.altitude,
      cemetery: cemetery ?? existingGraveLocation.cemetery,
    };
  }
}
