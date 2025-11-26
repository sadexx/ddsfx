import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { IClientInfo } from 'src/common/interfaces';

@Injectable()
export class ClientInfoValidationPipe implements PipeTransform<IClientInfo, IClientInfo> {
  /**
   * Validates the `IClientInfo` by checking if the User-Agent and IP address are present.
   * @throws BadRequestException if either the User-Agent or IP address is missing.
   * @param value The `IClientInfo` to be validated.
   * @returns The validated `IClientInfo`.
   */
  transform(value: IClientInfo): IClientInfo {
    if (!value.userAgent || value.userAgent.trim() === '') {
      throw new BadRequestException('User-Agent header is required');
    }

    if (!value.ipAddress || value.ipAddress.trim() === '') {
      throw new BadRequestException('IP address is required');
    }

    return value;
  }
}
