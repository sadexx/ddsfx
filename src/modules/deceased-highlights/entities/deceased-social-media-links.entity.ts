import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { EDeceasedSocialMediaLinkPlatform } from 'src/modules/deceased-highlights/common/enums';

export interface DeceasedSocialMediaLink {
  id: string;
  deceased: Deceased;
  platform: EDeceasedSocialMediaLinkPlatform;
  url: string;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedSocialMediaLink = new EntitySchema<DeceasedSocialMediaLink>({
  name: 'DeceasedSocialMediaLink',
  tableName: 'deceased_social_media_links',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_social_media_links',
      default: (): string => 'uuidv7()',
    },
    platform: {
      type: 'enum',
      name: 'platform',
      enum: EDeceasedSocialMediaLinkPlatform,
    },
    url: {
      type: 'varchar',
      name: 'url',
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
    deceased: {
      type: 'many-to-one',
      target: 'Deceased',
      joinColumn: {
        name: 'deceased_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_social_media_links_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
