import { ETokenName, ETokenSource } from 'src/libs/tokens/common/enums';

export interface IExtractionStrategy {
  source: ETokenSource;
  key: ETokenName;
}
