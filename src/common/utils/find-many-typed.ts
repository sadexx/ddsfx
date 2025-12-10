import { FindManyOptions, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

/**
 * Finds multiple entities by given options and returns them as given type.
 *
 * @param repository typeorm Repository instance
 * @param options typeorm FindMany options
 *
 * @returns found entities as given type (TReturnType)
 */
export async function findManyTyped<TReturnType>(
  repository: Repository<ObjectLiteral>,
  options: FindManyOptions<ObjectLiteral>,
): Promise<TReturnType> {
  const entities = await repository.find(options);

  return entities as TReturnType;
}

/**
 * Finds multiple entities by given options and returns them as given type and total count.
 *
 * @param repository TypeORM Repository instance.
 * @param options TypeORM FindManyOptions used to filter the query.
 *
 * @returns A tuple containing the typed entities (TReturnType) and the total count.
 */
export async function findManyAndCountTyped<TReturnType>(
  repository: Repository<ObjectLiteral>,
  options: FindManyOptions<ObjectLiteral>,
): Promise<[TReturnType, number]> {
  const [entities, count] = await repository.findAndCount(options);

  return [entities as TReturnType, count];
}

/**
 * Finds multiple entities by given query builder and returns them as given type.
 *
 * @param queryBuilder typeorm SelectQueryBuilder instance
 *
 * @returns found entities as given type (TReturnType)
 */
export async function findManyQueryBuilderTyped<TReturnType>(
  queryBuilder: SelectQueryBuilder<ObjectLiteral>,
): Promise<TReturnType> {
  const entities = await queryBuilder.getMany();

  return entities as TReturnType;
}

/**
 * Finds multiple entities by given query builder and returns them as given type and total count.
 *
 * @param queryBuilder typeorm SelectQueryBuilder instance
 *
 * @returns A tuple containing the typed entities (TReturnType) and the total count.
 */
export async function findManyAndCountQueryBuilderTyped<TReturnType>(
  queryBuilder: SelectQueryBuilder<ObjectLiteral>,
): Promise<[TReturnType, number]> {
  const [entities, count] = await queryBuilder.getManyAndCount();

  return [entities as TReturnType, count];
}
