import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { UserPasswordService } from 'src/modules/users/services';
import { UpdatePasswordDto } from 'src/modules/users/common/dto';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { ValidateAndTransformPipe } from 'src/common/pipes';
import { MessageOutput } from 'src/common/outputs';
import { RouteSchema } from '@nestjs/platform-fastify';

@Controller('users/password')
export class UserPasswordController {
  constructor(private readonly userPasswordService: UserPasswordService) {}

  @UseGuards(JwtFullAccessGuard)
  @Patch()
  @RouteSchema({ body: UpdatePasswordDto.schema })
  async updatePassword(
    @Body(ValidateAndTransformPipe) dto: UpdatePasswordDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<MessageOutput> {
    return this.userPasswordService.updatePassword(dto, user);
  }
}
