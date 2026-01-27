import { EStaticPageType } from 'src/modules/informational-pages/common/enums';

export interface IStaticPage {
  type: EStaticPageType;
  content: string;
}
