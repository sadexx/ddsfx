import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IFile } from 'src/libs/file-management/common/interfaces';

export const UploadedFile = createParamDecorator((_data: unknown, context: ExecutionContext): IFile | undefined => {
  const request = context.switchToHttp().getRequest<FastifyRequest & { uploadedFile: IFile }>();

  return request.uploadedFile;
});
