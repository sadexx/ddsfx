import { Injectable } from '@nestjs/common';
import { AbstractJwtTokenGuard } from 'src/libs/guards/common/abstract-guards';
import { ETokenName, ETokenSource } from 'src/libs/tokens/common/enums';
import { IExtractionStrategy, IJwtTokenPayload, ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { EUserRoleName } from 'src/modules/users/common/enum';

@Injectable()
export class JwtFullAccessGuard extends AbstractJwtTokenGuard {
  protected getExtractionStrategies(): IExtractionStrategy[] {
    return [{ source: ETokenSource.COOKIE, key: ETokenName.ACCESS_TOKEN }];
  }

  protected async verifyAccessToken(token: string): Promise<ITokenUserPayload> {
    const payload: IJwtTokenPayload = await this.tokenService.verifyAccessToken(token);

    return {
      sub: payload['sub'] as string,
      sessionId: payload['sessionId'] as string,
      roleName: payload['roleName'] as EUserRoleName,
    };
  }
}
