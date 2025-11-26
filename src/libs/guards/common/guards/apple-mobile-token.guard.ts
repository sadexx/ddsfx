import { AbstractAppleMobileTokenGuard } from 'src/libs/guards/common/abstract-guards';
import { ETokenName, ETokenSource } from 'src/libs/tokens/common/enums';
import { IAppleProviderOutput, IExtractionStrategy } from 'src/libs/tokens/common/interfaces';

export class AppleMobileTokenGuard extends AbstractAppleMobileTokenGuard {
  protected getExtractionStrategies(): IExtractionStrategy[] {
    return [{ source: ETokenSource.BODY, key: ETokenName.ID_TOKEN }];
  }

  protected async verifyAppleToken(idToken: string): Promise<IAppleProviderOutput> {
    return await this.tokenService.verifyAppleToken(idToken);
  }
}
