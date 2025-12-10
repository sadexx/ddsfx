import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { EKinshipType } from 'src/modules/deceased/common/enums';
import { User } from 'src/modules/users/entities';

export interface DeceasedSubscription {
  id: string;
  user: User;
  deceased: Deceased;
  kinshipType: EKinshipType;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedSubscription = new EntitySchema<DeceasedSubscription>({
  name: 'DeceasedSubscription',
  tableName: 'deceased_subscriptions',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_subscriptions',
      default: (): string => 'uuidv7()',
    },
    kinshipType: {
      type: 'enum',
      name: 'kinship_type',
      enum: EKinshipType,
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
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_subscriptions_users',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    deceased: {
      type: 'many-to-one',
      target: 'Deceased',
      joinColumn: {
        name: 'deceased_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_subscriptions_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
