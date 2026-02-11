/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreatePayload } from 'src/common/types';
import { StaticPage } from 'src/modules/informational-pages/entities';

export interface IStaticPage extends CreatePayload<StaticPage> {}
