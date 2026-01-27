import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { FileUploadService } from 'src/libs/file-management/common/upload-strategies';
import { IFile, IFileUploadContext } from 'src/libs/file-management/common/interfaces';
import { FILE_CONFIG } from 'src/libs/file-management/common/constants';
import { UploadFileDto } from 'src/libs/file-management/common/dto';

/**
 * Interceptor for handling single file uploads in multipart/form-data requests.
 *
 * @description
 * Implements NestJS interceptor pattern to process single file uploads before the request
 * reaches the controller. This interceptor acts as the HTTP boundary layer, managing the
 * lifecycle of HTTP-level resources (request streams, response handling) while delegating
 * business logic (validation, upload) to the service layer.
 *
 * ## Responsibilities
 *
 * **HTTP Layer Concerns:**
 * - Validates multipart request format
 * - Checks file size against global limits (via `content-length` header)
 * - Extracts file stream from Fastify multipart request
 * - On success, attaches uploaded file metadata to request object for controller access
 * - Cleans up cloud storage (S3) on upload failure
 *
 * ## Throws
 *
 * - {@link BadRequestException} - When request is not multipart/form-data
 * - {@link BadRequestException} - When file size exceeds {@link GLOBAL_MAX_ALLOWED_FILE_SIZE}
 * - {@link BadRequestException} - When no file is present in request
 * - {@link BadRequestException} - When file upload or validation fails (wraps underlying error)
 *
 */
@Injectable()
export class SingleFileInterceptor implements NestInterceptor {
  constructor(private readonly uploadService: FileUploadService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest<{ Querystring: UploadFileDto }> & { uploadedFile: IFile }>();
    const category = request.query.category;
    const uploadContext: IFileUploadContext = {};

    if (!request.isMultipart || !request.isMultipart()) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const fileSize = Number(request.headers['content-length']);

      if (fileSize > FILE_CONFIG.MAX_REQUEST_SIZE) {
        throw new BadRequestException('File size exceeds the maximum limit');
      }

      const multipartFile = await request.file();

      if (!multipartFile) {
        throw new BadRequestException('No file uploaded');
      }

      request.uploadedFile = await this.uploadService.uploadFile(uploadContext, multipartFile, category);
    } catch (error) {
      if (uploadContext.uploadedFile) {
        await this.uploadService.deleteFailedFiles([uploadContext.uploadedFile]);
      }

      throw new BadRequestException(`Single file upload failed: ${(error as Error).message}`);
    }

    return next.handle();
  }
}
