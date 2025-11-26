import { Injectable } from '@nestjs/common';
import { AbstractOpaqueTokenGuard } from 'src/libs/guards/common/abstract-guards';
import { ETokenName, ETokenSource } from 'src/libs/tokens/common/enums';
import { IExtractionStrategy, IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class OpqRegistrationGuard extends AbstractOpaqueTokenGuard {
  protected getExtractionStrategies(): IExtractionStrategy[] {
    return [{ source: ETokenSource.COOKIE, key: ETokenName.REGISTRATION_TOKEN }];
  }

  protected async parseAndVerify(token: string): Promise<IOpaqueTokenData | null> {
    return await this.tokenService.verifyRegistrationToken(token);
  }
}
