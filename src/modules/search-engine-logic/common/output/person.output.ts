import { PersonSchema } from 'src/modules/search-engine-logic/schemas';

export interface IPersonOutput extends PersonSchema {
  score: number | string;
}
