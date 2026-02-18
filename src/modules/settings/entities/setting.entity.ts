import { EntitySchema } from 'typeorm';

export interface Setting {
  id: string;
  description: string;
  fastSearchMaxRequestsPerHour: number;
  mobileFileKey: string;
  mobilePreviewFileKey: string;
  mobilePortraitFileKey: string;
  firstPostFromFreyaId: string;
  creationDate: Date;
  updatingDate: Date;
}

export const Setting = new EntitySchema<Setting>({
  name: 'Setting',
  tableName: 'settings',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      default: (): string => 'uuidv7()',
    },
    description: {
      type: 'varchar',
      name: 'description',
    },
    fastSearchMaxRequestsPerHour: {
      type: 'integer',
      name: 'fast_search_max_requests_per_hour',
    },
    mobileFileKey: {
      type: 'varchar',
      name: 'mobile_file_key',
    },
    mobilePreviewFileKey: {
      type: 'varchar',
      name: 'mobile_preview_file_key',
    },
    mobilePortraitFileKey: {
      type: 'varchar',
      name: 'mobile_portrait_file_key',
    },
    firstPostFromFreyaId: {
      type: 'uuid',
      name: 'first_post_from_freya_id',
    },
    creationDate: {
      type: 'timestamptz',
      name: 'creation_date',
      createDate: true,
    },
    updatingDate: {
      type: 'timestamptz',
      name: 'updating_date',
      updateDate: true,
    },
  },
});
