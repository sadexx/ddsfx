import { Injectable } from '@nestjs/common';
import { Cemetery, GraveLocation } from 'src/modules/cemetery/entities';
import { EntityManager } from 'typeorm';
import { CreateGraveLocationDto, UpdateGraveLocationDto } from 'src/modules/cemetery/common/dto';
import { IGraveLocation } from 'src/modules/cemetery/common/interfaces';
import {
  TCreateDeceasedProfileCemetery,
  TUpdateDeceasedProfile,
  TUpdateDeceasedProfileCemetery,
} from 'src/modules/deceased/common/types';
import { StrictOmit } from 'src/common/types';
import { TConstructGraveLocationDtoDeceased } from 'src/modules/cemetery/common/types';
import { Deceased } from 'src/modules/deceased/entities';

@Injectable()
export class GraveLocationService {
  constructor() {}

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
      cemetery: cemetery as Cemetery,
      deceased: deceased as Deceased,
      latitude: dto?.latitude ?? null,
      longitude: dto?.longitude ?? null,
      altitude: dto?.altitude ?? null,
    };
  }

  private constructUpdateGraveLocationDto(
    existingGraveLocation: NonNullable<TUpdateDeceasedProfile['graveLocation']>,
    cemetery: TUpdateDeceasedProfileCemetery | null,
    dto?: UpdateGraveLocationDto,
  ): StrictOmit<IGraveLocation, 'deceased'> {
    const cemeteryChanged = cemetery && cemetery.id !== existingGraveLocation.cemetery.id;

    return {
      cemetery: (cemetery ?? existingGraveLocation.cemetery) as Cemetery,
      latitude: dto?.latitude !== undefined ? dto.latitude : cemeteryChanged ? null : existingGraveLocation.latitude,
      longitude:
        dto?.longitude !== undefined ? dto.longitude : cemeteryChanged ? null : existingGraveLocation.longitude,
      altitude: dto?.altitude !== undefined ? dto.altitude : cemeteryChanged ? null : existingGraveLocation.altitude,
    };
  }
}
