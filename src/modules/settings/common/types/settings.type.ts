import { QueryResultType } from 'src/common/types';
import { FindOptionsSelect } from 'typeorm';
import { Setting } from 'src/modules/settings/entities';

export const SettingsQuery = {
  select: {
    description: true,
    fastSearchMaxRequestsPerHour: true,
    mobileFileKey: true,
    mobilePreviewFileKey: true,
    mobilePortraitFileKey: true,
    firstPostFromFreyaId: true,
    creationDate: true,
    updatingDate: true,
  } as const satisfies FindOptionsSelect<Setting>,
};
export type TSettings = QueryResultType<Setting, typeof SettingsQuery.select>;

export const MobileSettingsQuery = {
  select: {
    mobileFileKey: true,
    mobilePreviewFileKey: true,
    mobilePortraitFileKey: true,
    updatingDate: true,
  } as const satisfies FindOptionsSelect<Setting>,
};
export type TMobileSettings = QueryResultType<Setting, typeof MobileSettingsQuery.select>;
