import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { CurrentUser } from 'src/common/decorators';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { MultipleFilesInterceptor, SingleFileInterceptor } from 'src/libs/file-management/common/interceptors';
import { UploadedFile, UploadedFiles } from 'src/libs/file-management/common/decorators';
import { FileManagementService } from 'src/libs/file-management/services';
import { IFile } from 'src/libs/file-management/common/interfaces';
import { UploadFileDto } from 'src/libs/file-management/common/dto';
import { EntityIdOutput, MessageOutput } from 'src/common/outputs';
import { SavedFileOutput } from 'src/libs/file-management/common/outputs';

@Controller('file-management')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) {}

  @UseGuards(JwtFullAccessGuard)
  @Post('/file')
  @RouteSchema({ querystring: UploadFileDto.schema })
  @UseInterceptors(SingleFileInterceptor)
  async uploadFile(
    @CurrentUser() user: ITokenUserPayload,
    @UploadedFile() file: IFile,
    @Query() query: UploadFileDto,
  ): Promise<EntityIdOutput> {
    return await this.fileManagementService.uploadFile(user, file, query);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('/files')
  @RouteSchema({ querystring: UploadFileDto.schema })
  @UseInterceptors(MultipleFilesInterceptor)
  async uploadFiles(
    @CurrentUser() user: ITokenUserPayload,
    @UploadedFiles() files: IFile[],
    @Query() query: UploadFileDto,
  ): Promise<SavedFileOutput[]> {
    return await this.fileManagementService.uploadFiles(user, files, query);
  }

  @UseGuards(JwtFullAccessGuard)
  @Patch('/file/:id')
  @RouteSchema({ params: UUIDParamDto.schema, querystring: UploadFileDto.schema })
  @UseInterceptors(SingleFileInterceptor)
  async updateFile(
    @Param() param: UUIDParamDto,
    @CurrentUser() user: ITokenUserPayload,
    @UploadedFile() file: IFile,
    @Query() query: UploadFileDto,
  ): Promise<MessageOutput> {
    return await this.fileManagementService.updateFile(param.id, user, file, query);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/file/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param() param: UUIDParamDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    await this.fileManagementService.deleteFile(param.id, user);
  }
}
