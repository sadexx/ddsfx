import { EntitySchema } from 'typeorm';
import { EComplaintsType } from 'src/modules/complaint-form/common/enum';
import { User } from 'src/modules/users/entities';

export interface ComplaintForm {
  id: string;
  reportedUser: User;
  subjectUser: User;
  complaintType: EComplaintsType;
  message: string | null;
  creationDate: Date;
  updatingDate: Date;
}

export const ComplaintForm = new EntitySchema<ComplaintForm>({
  name: 'ComplaintForm',
  tableName: 'complaint_forms',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_complaint_forms',
      default: (): string => 'uuidv7()',
    },
    complaintType: {
      type: 'enum',
      name: 'complaint_type',
      enum: EComplaintsType,
    },
    message: {
      type: 'text',
      name: 'message',
      nullable: true,
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
    reportedUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'reported_user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_complaint_forms_reported_user',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    subjectUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'subject_user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_complaint_forms_subject_user',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
