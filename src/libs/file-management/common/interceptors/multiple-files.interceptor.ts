import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { FileUploadService } from 'src/libs/file-management/common/upload-strategies';
import { IFile } from 'src/libs/file-management/common/interfaces';
import { MAX_FILE_SIZE_LIMIT } from 'src/common/constants';
import { UploadFileDto } from 'src/libs/file-management/common/dto';

/**
 * Interceptor for handling multiple file uploads in multipart/form-data requests.
 *
 * @description
 * Implements NestJS interceptor pattern to process multiple file uploads concurrently.
 * Uses a sophisticated "output parameter" pattern to track partial uploads for cleanup
 * when errors occur mid-batch.  This is critical for preventing orphaned S3 objects when
 * some files upload successfully before a validation error occurs on a later file.
 *
 * ## Responsibilities
 *
 * **HTTP Layer Concerns:**
 * - Validates multipart request format
 * - Checks total upload size against global limits (via `content-length` header)
 * - Extracts files iterator from Fastify multipart request
 * - Tracks partially uploaded files in output mutated array for cleanup
 * - Attaches all uploaded file metadata to request object for controller access
 * - Cleans up cloud storage (S3) for partial uploads on failure
 *
 * ## Throws
 *
 * - {@link BadRequestException} - When request is not multipart/form-data
 * - {@link BadRequestException} - When total size exceeds {@link GLOBAL_MAX_ALLOWED_FILE_SIZE}
 * - {@link BadRequestException} - When files iterator is not available
 * - {@link BadRequestException} - When any file upload or validation fails (wraps underlying error)
 *
 */
@Injectable()
export class MultipleFilesInterceptor implements NestInterceptor {
  constructor(private readonly uploadService: FileUploadService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest<{ Querystring: UploadFileDto }> & { uploadedFiles: IFile[] }>();

    const uploadedFiles: IFile[] = [];
    const category = request.query.category;

    if (!request.isMultipart || !request.isMultipart()) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const filesSize = Number(request.headers['content-length']);

      if (filesSize > MAX_FILE_SIZE_LIMIT) {
        throw new BadRequestException('File size exceeds the maximum limit');
      }

      const filesIterator = request.files();

      if (!filesIterator) {
        throw new BadRequestException('No files uploaded');
      }

      request.uploadedFiles = await this.uploadService.uploadFiles(uploadedFiles, filesIterator, category);
    } catch (error) {
      if (uploadedFiles && uploadedFiles.length > 0) {
        await this.uploadService.deleteFailedFiles(uploadedFiles);
      }

      throw new BadRequestException(`Multiple files upload failed: ${(error as Error).message}`);
    }

    return next.handle();
  }
}
