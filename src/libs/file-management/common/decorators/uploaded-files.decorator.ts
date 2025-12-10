import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IFile } from 'src/libs/file-management/common/interfaces';

export const UploadedFiles = createParamDecorator((_data: unknown, context: ExecutionContext): IFile[] => {
  const request = context.switchToHttp().getRequest<FastifyRequest & { uploadedFiles: IFile[] }>();

  return request.uploadedFiles;
});
