import { Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { MultipleFilesInterceptor, SingleFileInterceptor } from 'src/libs/file-management/common/interceptors';
import { UploadedFile, UploadedFiles } from 'src/libs/file-management/common/decorators';
import { FileManagementService } from 'src/libs/file-management/services';
import { IFile } from 'src/libs/file-management/common/interfaces';
import { UploadFileDto } from 'src/libs/file-management/common/dto';
import { UUIDParamDto } from 'src/common/dto';
import { IMessageOutput } from 'src/common/outputs';

@Controller('file-management')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) {}

  @Post('/file')
  @RouteSchema({ querystring: UploadFileDto.schema })
  @UseInterceptors(SingleFileInterceptor)
  async uploadFile(@UploadedFile() file: IFile, @Query() query: UploadFileDto): Promise<IMessageOutput> {
    return await this.fileManagementService.uploadFile(file, query);
  }

  @Post('/files')
  @RouteSchema({ querystring: UploadFileDto.schema })
  @UseInterceptors(MultipleFilesInterceptor)
  async uploadFiles(@UploadedFiles() files: IFile[], @Query() query: UploadFileDto): Promise<IMessageOutput> {
    return await this.fileManagementService.uploadFiles(files, query);
  }

  @Patch('/file/:id')
  @RouteSchema({ params: UUIDParamDto.schema, querystring: UploadFileDto.schema })
  @UseInterceptors(SingleFileInterceptor)
  async updateFile(
    @Param() { id }: UUIDParamDto,
    @UploadedFile() file: IFile,
    @Query() query: UploadFileDto,
  ): Promise<IMessageOutput> {
    return await this.fileManagementService.updateFile(id, file, query);
  }

  @Delete('/file/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('id') id: string): Promise<void> {
    await this.fileManagementService.deleteFile(id);
  }
}
