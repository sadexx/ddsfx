import { EntitySchema } from 'typeorm';

export interface Setting {
  id: string;
  description: string;
  fastSearchMaxRequestsPerHour: number;
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
