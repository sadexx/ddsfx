import { FaqCategory } from 'src/modules/informational-pages/entities';

export interface IFaqItem {
  question: string;
  answer: string;
  category: FaqCategory;
}
