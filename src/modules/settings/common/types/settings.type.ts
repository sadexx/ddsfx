import { QueryResultType } from 'src/common/types/type-orm-query-result.type';
import { FindOptionsSelect } from 'typeorm';
import { Setting } from 'src/modules/settings/entities';

export const SettingsQuery = {
  select: {
    description: true,
    fastSearchMaxRequestsPerHour: true,
    creationDate: true,
    updatingDate: true,
  } as const satisfies FindOptionsSelect<Setting>,
};
export type TSettings = QueryResultType<Setting, typeof SettingsQuery.select>;
