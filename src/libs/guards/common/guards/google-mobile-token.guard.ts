import { Injectable } from '@nestjs/common';
import { AbstractGoogleMobileTokenGuard } from 'src/libs/guards/common/abstract-guards';
import { ETokenName, ETokenSource } from 'src/libs/tokens/common/enums';
import { IGoogleProviderOutput, IExtractionStrategy } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class GoogleMobileTokenGuard extends AbstractGoogleMobileTokenGuard {
  protected getExtractionStrategies(): IExtractionStrategy[] {
    return [{ source: ETokenSource.BODY, key: ETokenName.ID_TOKEN }];
  }

  protected async verifyGoogleToken(idToken: string): Promise<IGoogleProviderOutput> {
    return await this.tokenService.verifyGoogleToken(idToken);
  }
}
