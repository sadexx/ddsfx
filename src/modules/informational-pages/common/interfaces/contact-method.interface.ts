import { File } from 'src/libs/file-management/entities';

export interface IContactMethod {
  description: string;
  url: string;
  file: File;
}
