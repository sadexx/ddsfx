import { Brackets, SelectQueryBuilder } from 'typeorm';
import { Cemetery } from 'src/modules/cemetery/entities';
import { GetCemeteriesDto } from 'src/modules/cemetery/common/dto';

export class CemeteryQueryOptionsService {
  public getCemeteriesOptions(queryBuilder: SelectQueryBuilder<Cemetery>, dto: GetCemeteriesDto): void {
    queryBuilder.select(['cemetery.id', 'cemetery.name', 'cemetery.creationDate']).take(dto.limit).skip(dto.offset);

    if (dto.sortOrder) {
      queryBuilder.orderBy('cemetery.creationDate', dto.sortOrder);
    }

    if (dto.searchField) {
      this.applySearchForCemeteries(queryBuilder, dto.searchField);
    }
  }

  private applySearchForCemeteries(queryBuilder: SelectQueryBuilder<Cemetery>, searchField: string): void {
    const searchTerm = `%${searchField}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where('cemetery.name ILIKE :search', { search: searchTerm });
      }),
    );
  }
}
