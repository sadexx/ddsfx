import { BadRequestException, Injectable } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import * as fastifyMultipart from '@fastify/multipart';
import path from 'node:path';
import { Readable } from 'stream';
import { fileTypeFromBuffer } from 'file-type';
import { generateUuidV7 } from 'src/common/utils';
import { AwsS3Service } from 'src/libs/aws/s3/services';
import { FILE_CONFIG, FOLDER_PATH_MAP } from 'src/libs/file-management/common/constants';
import { IFile, IFileUploadContext } from 'src/libs/file-management/common/interfaces';
import { EContentType, EFileExtension, EFileType } from 'src/libs/file-management/common/enums';
import { BucketLocationConstraint, StorageClass } from '@aws-sdk/client-s3';
import { EnvConfig } from 'src/config/common/types';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { PassThrough } from 'node:stream';

@Injectable()
export class FileUploadService {
  private readonly DEFAULT_STORAGE_TYPE: string = 'aws-s3';
  private readonly DEFAULT_STORAGE_CLASS: StorageClass = StorageClass.STANDARD;
  private readonly DEFAULT_REGION: BucketLocationConstraint;
  private readonly DEFAULT_SAMPLE_SIZE = 4100;
  private readonly ALLOWED_MIME_TYPES: EContentType[] = Object.values(EContentType);
  private readonly ALLOWED_EXTENSIONS: EFileExtension[] = Object.values(EFileExtension);

  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: AwsS3Service,
  ) {
    const { AWS_REGION } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.DEFAULT_REGION = AWS_REGION as BucketLocationConstraint;
  }

  /**
   * Uploads a single file to cloud storage with comprehensive validation and stream management.
   *
   * @description
   * Orchestrates the complete file upload process: validates file content via magic numbers,
   * generates storage metadata, uploads to S3 via streaming, and manages stream lifecycle.
   * All errors propagate to interceptor after stream cleanup.
   *
   * ## Process Flow
   *
   * 1. **Validate File Signature** - Reads first 4KB, detects actual file type via magic numbers
   * 2. **Check Against Whitelist** - Ensures detected MIME type and extension are allowed
   * 3. **Verify No Spoofing** - Compares detected type with claimed type from client
   * 4. **Generate Metadata** - Creates UUID-based storage key, determines folder path
   * 5. **Upload Stream** - Pipes recreated stream to S3
   * 6. **Return Metadata** - Provides file location and properties, destroys stream on failure
   *
   * @param data - Multipart file from Fastify containing stream and claimed metadata
   * @param category - File category determining storage path (e.g., 'deceased-photos')
   *
   * @returns Promise resolving to {@link IFile} with storage metadata
   *
   * @throws {BadRequestException} When file is empty, type not allowed, or validation fails
   * @throws {ServiceUnavailableException} When S3 upload fails (thrown by storage service)
   *
   */
  public async uploadFile(uploadContext: IFileUploadContext, data: MultipartFile, category: EFileType): Promise<IFile> {
    try {
      const { stream, detectedMimeType, detectedExtension } = await this.validateFileSignature(data);
      const uploadedFile: IFile = {
        ...this.generateFileMetadata(data.filename, detectedMimeType, detectedExtension, category),
      };

      await this.storageService.uploadObject(uploadedFile.fileKey, stream, detectedMimeType);

      uploadedFile.size = data.file.bytesRead;
      uploadContext.uploadedFile = uploadedFile;

      this.validateFileSize(data.file.bytesRead, detectedMimeType);

      return uploadedFile;
    } catch (error) {
      if (data.file && !data.file.destroyed) {
        data.file.destroy();
      }

      throw error;
    }
  }

  /**
   * Uploads multiple files concurrently with partial result tracking.
   *
   * @description
   * Processes an async iterator of files, uploading each one sequentially while
   * tracking successful uploads in an output parameter array. This design allows
   * the caller to clean up partial uploads when errors occur mid-batch. For example,
   * if 4 files are being uploaded and file #3 fails validation, files #1 and #2 can
   * be safely removed from S3.
   *
   * ## Process Flow same as {@link uploadFile} for each file.
   *
   * @param uploadedFiles - **Output parameter** - Empty array that will be mutated with uploaded file metadata
   * @param filesParts - Async iterator of multipart files from Fastify
   * @param category - File category determining storage path
   *
   * @return Promise resolving to {@link IFile} same array as `uploadedFiles` parameter (for convenience)
   *
   * @throws {BadRequestException} When any file fails validation (stops processing remaining files)
   * @throws {ServiceUnavailableException} When S3 upload fails for any file
   *
   */
  public async uploadFiles(
    uploadedFiles: IFile[],
    filesParts: AsyncIterableIterator<fastifyMultipart.MultipartFile>,
    category: EFileType,
  ): Promise<IFile[]> {
    for await (const filePart of filesParts) {
      try {
        const { stream, detectedMimeType, detectedExtension } = await this.validateFileSignature(filePart);
        const uploadedFile: IFile = {
          ...this.generateFileMetadata(filePart.filename, detectedMimeType, detectedExtension, category),
        };

        await this.storageService.uploadObject(uploadedFile.fileKey, stream, detectedMimeType);
        const currentSize = filePart.file.bytesRead;
        uploadedFile.size = currentSize;

        uploadedFiles.push(uploadedFile);

        this.validateFileSize(currentSize, detectedMimeType);
      } catch (error) {
        if (filePart.file && !filePart.file.destroyed) {
          filePart.file.destroy();
        }

        throw error;
      }
    }

    return uploadedFiles;
  }

  /**
   * Deletes multiple files from cloud storage in a single batch operation.
   * Used for cleanup after a failed upload attempt.
   * @param files - An array of IFile objects that failed to upload.
   *
   */
  public async deleteFailedFiles(files: IFile[]): Promise<void> {
    const objectsToDelete = files.map((file) => ({ Key: file.fileKey }));
    await this.storageService.deleteObjects(objectsToDelete);
  }

  /**
   * Generates complete file metadata for storage.
   *
   * @description
   * Creates an {@link IFile} object containing all metadata needed for file storage,
   * retrieval, and management. Uses validated file type information (from magic number
   * detection) rather than user-provided data. Generates UUIDv7 for storage keys.
   *
   * ## Generated Fields
   *
   * **Storage Location:**
   * - `storageType` - Cloud provider (`'aws-s3'`)
   * - `storageClass` - S3 storage class (`'STANDARD'`, `'GLACIER'`, etc.)
   * - `storageRegion` - AWS region (`'us-east-1'`, etc.)
   * - `storagePath` - Folder path (`'media/photos'`)
   * - `storageKey` - Unique filename (`'019ae0d8-uuid.jpg'`)
   * - `fileKey` - Full S3 key (`'media/photos/019ae0d8-uuid.jpg'`)
   *
   * **File Properties:**
   * - `originalName` - User's filename without extension (`'CompressJPEG.online_50kb_1703'`)
   * - `originalFullName` - User's full filename (`'CompressJPEG.online_50kb_1703.JPG'`)
   * - `size` - File size in bytes (set after upload)
   * - `mimetype` - Detected MIME type (`'image/jpeg'`)
   * - `extension` - Detected extension with period (`'.jpg'`)
   *
   * ## Folder Path Determination
   *
   * Uses {@link FOLDER_PATH_MAP} to map file category to storage path:
   * ```typescript
   * category: 'photos' → path: 'media/photos'
   * category: 'videos' → path: 'media/videos'
   * ```
   *
   * @param originalFullName - User's uploaded filename (e.g., `'photo.JPG'`)
   * @param mimetype - Detected MIME type from magic numbers (e.g., `'image/jpeg'`)
   * @param extension - Detected extension from magic numbers (e.g., `'jpg'`, no period)
   * @param fileType - File category from request query (e.g., `'photos'`)
   * @param storageType - Cloud provider type (defaults to `'aws-s3'`)
   *
   * @returns Complete file {@link IFile} metadata object
   *
   */
  private generateFileMetadata(
    originalFullName: string,
    mimetype: string,
    extension: string,
    fileType: EFileType,
    storageType: string = this.DEFAULT_STORAGE_TYPE,
  ): IFile {
    const storagePath = this.getFolderPath(fileType);
    const generatedFileName = this.generateUniqueFilename(extension);
    const originalExtension = path.extname(originalFullName);
    const originalNameWithoutExt = path.basename(originalFullName, originalExtension);

    return {
      storageType: storageType,
      storageClass: this.DEFAULT_STORAGE_CLASS,
      storageRegion: this.DEFAULT_REGION,
      originalName: originalNameWithoutExt,
      originalFullName: originalFullName,
      storageKey: generatedFileName,
      storagePath: storagePath,
      fileKey: `${storagePath}/${generatedFileName}`,
      size: 0,
      mimetype: mimetype,
      extension: `.${extension}`,
    };
  }

  /**
   * Maps file category to storage folder path.
   *
   * @param fileType - File category (e.g., 'photos')
   * @returns Storage folder path (e.g., 'media/photos')
   *
   */
  private getFolderPath(fileType: EFileType): string {
    const folderPath = FOLDER_PATH_MAP[fileType];

    return folderPath;
  }

  /**
   * Generates a unique filename in the format: {UUID}.{extension}.
   *
   * Used to prevent conflicts by appending a UUID to the original filename.
   */
  private generateUniqueFilename(extension: string): string {
    return `${generateUuidV7()}.${extension}`;
  }

  /**
   * Checks if uploaded file is empty.
   *
   * @remarks
   * Checks multiple indicators of an empty file:
   * - No filename
   * - Empty filename
   * - No file stream
   * - No bytes read
   * - Stream has no readable content
   */
  private isEmptyFile(file: fastifyMultipart.MultipartFile): boolean {
    return (
      !file.filename ||
      file.filename.trim() === '' ||
      !file.file ||
      file.file.bytesRead === 0 ||
      file.file.readableLength === 0
    );
  }

  /**
   * Validates file type by reading magic numbers (file signature).
   *
   * @description
   * Performs comprehensive file validation using magic number detection to prevent
   * file type spoofing attacks. Reads the first 4KB of the file to detect actual
   * file type, then verifies it matches user claims and is in the whitelist.
   * These bytes cannot be spoofed - they're required for parsers to read the file.
   *
   * @see Supported file types: {@link https://github.com/sindresorhus/file-type?tab=readme-ov-file#supported-file-types file-type library}
   *
   * ## Process Flow
   *
   * 1. **Check Empty** - Reject zero-byte files
   * 2. **Read Sample** - Get first 4100 bytes without consuming entire stream
   * 3. **Detect Type** - Use `file-type` library to read magic numbers
   * 4. **Validate Type** - Check against {@link ALLOWED_MIME_TYPES} whitelist
   * 5. **Check Mismatch** - Compare detected type with claimed type
   * 6. **Recreate Stream** - Combine read chunk with remaining stream data
   *
   * Returns object with:
   * - `stream` - Recreated stream ready for upload (includes all file data)
   * - `detectedMimeType` - Actual MIME type from magic numbers
   * - `detectedExtension` - Actual extension from magic numbers (no period)
   *
   * @param stream - Multipart file from Fastify
   *
   * @returns Object with recreated stream and detected file type information
   *
   * @throws {BadRequestException} When file is empty
   * @throws {BadRequestException} When file type cannot be determined
   * @throws {BadRequestException} When detected MIME type not in whitelist
   * @throws {BadRequestException} When detected extension not in whitelist
   * @throws {BadRequestException} When claimed MIME type doesn't match detected type
   * @throws {BadRequestException} When claimed extension doesn't match detected type
   *

   */

  private async validateFileSignature(
    stream: MultipartFile,
  ): Promise<{ stream: Readable; detectedMimeType: string; detectedExtension: string }> {
    if (this.isEmptyFile(stream)) {
      throw new BadRequestException('Uploaded file is empty');
    }

    const firstChunk = await this.readFirstChunk(stream.file, this.DEFAULT_SAMPLE_SIZE);
    const validSample =
      firstChunk.length > this.DEFAULT_SAMPLE_SIZE ? firstChunk.subarray(0, this.DEFAULT_SAMPLE_SIZE) : firstChunk;

    const fileTypeResult = await fileTypeFromBuffer(validSample);

    if (!fileTypeResult) {
      throw new BadRequestException('Unable to determine file type');
    }

    const claimedFilename = stream.filename;
    const claimedMimetype = stream.mimetype;
    this.checkForTypeMismatch(claimedFilename, claimedMimetype, fileTypeResult.mime, fileTypeResult.ext);

    const newStream = this.recreateStream(firstChunk, stream.file);

    return {
      stream: newStream,
      detectedMimeType: fileTypeResult.mime,
      detectedExtension: fileTypeResult.ext,
    };
  }

  /**
   * Reads first N bytes from stream without consuming entire stream.
   *
   * @description
   * Reads a sample from the beginning of a stream for validation purposes,
   * then pauses the stream so remaining data can be read later.  Critical
   * for magic number detection without loading entire file into memory.
   *
   * @param stream - Readable stream to sample
   * @param minBytes - Number of bytes to read (default 4100)
   *
   * @returns Promise resolving to buffer with first N bytes
   */

  private async readFirstChunk(stream: Readable, minBytes: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let totalLength = 0;

      const onData = (chunk: Buffer): void => {
        chunks.push(chunk);
        totalLength += chunk.length;

        if (totalLength >= minBytes) {
          cleanup();
          resolve(Buffer.concat(chunks));
        }
      };

      const onEnd = (): void => {
        cleanup();
        resolve(Buffer.concat(chunks));
      };

      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };

      const cleanup = (): void => {
        stream.removeListener('data', onData);
        stream.removeListener('end', onEnd);
        stream.removeListener('error', onError);
        stream.pause();
      };

      stream.on('data', onData);
      stream.on('end', onEnd);
      stream.on('error', onError);
    });
  }

  /**
   * Validates file type against whitelists and checks for spoofing.
   *
   * @description
   * Performs multi-layer validation:
   * 1. Detected MIME type is in {@link ALLOWED_MIME_TYPES}
   * 2. Detected extension is in {@link ALLOWED_EXTENSIONS}
   * 3. Claimed MIME type matches detected type
   * 4. Claimed extension matches detected type
   *
   * @param claimedFilename - Filename from HTTP request
   * @param claimedMimetype - MIME type from HTTP request
   * @param detectedMimetype - MIME type from magic numbers
   * @param detectedExtension - Extension from magic numbers (no period)
   *
   * @throws {BadRequestException} When any validation fails
   */

  private checkForTypeMismatch(
    claimedFilename: string,
    claimedMimetype: string,
    detectedMimetype: string,
    detectedExtension: string,
  ): void {
    const claimedExtension = path.extname(claimedFilename).toLowerCase();
    const detectedExtWithDot = `.${detectedExtension.toLowerCase()}`;

    if (!this.ALLOWED_MIME_TYPES.includes(detectedMimetype as EContentType)) {
      throw new BadRequestException(`File type: ${detectedMimetype}, is not allowed.`);
    }

    if (!this.ALLOWED_EXTENSIONS.includes(detectedExtWithDot as EFileExtension)) {
      throw new BadRequestException(`File extension: ${detectedExtWithDot}, is not allowed`);
    }

    if (claimedMimetype !== detectedMimetype) {
      throw new BadRequestException(
        `MIME type mismatch: claimed: ${claimedMimetype}, actual: ${detectedMimetype}, file: ${claimedFilename}`,
      );
    }

    if (claimedExtension !== detectedExtWithDot) {
      throw new BadRequestException(
        `Extension mismatch: claimed: ${claimedExtension}, actual: ${detectedExtWithDot}, file: ${claimedFilename}`,
      );
    }
  }

  /**
   * Recreates a readable stream from a buffer and partially-consumed stream.
   *
   * @description
   * Combines data already read (buffer) with remaining stream data to create
   * a complete stream. Necessary after reading sample bytes for validation.
   * First 4100 bytes are in buffer, stream is paused at byte 4101.
   * Can't use original stream for upload (missing first 4100 bytes).
   * Must combine buffer + remaining stream.
   *
   * @param buffer - Already-read bytes from stream start
   * @param originalStream - Paused stream with remaining data
   *
   * @returns New readable stream with complete file data
   */
  private recreateStream(buffer: Buffer, originalStream: Readable): Readable {
    const newStream = new PassThrough();
    newStream.write(buffer);
    originalStream.pipe(newStream);

    return newStream;
  }

  /**
   * Validates file size against category-specific limits.
   *
   * @description
   * Enforces different size restrictions based on file category:
   * - Images: IMAGE_SIZE
   * - Videos: VIDEO_SIZE
   *
   * @param fileSize - Actual file size in bytes
   * @param detectedMimeType - MIME type from magic number detection
   *
   * @throws {BadRequestException} When file exceeds category limit
   */
  private validateFileSize(fileSize: number, detectedMimeType: string): void {
    let maxSize: number;

    if (detectedMimeType.startsWith('image/')) {
      maxSize = FILE_CONFIG.IMAGE_SIZE;
    } else if (detectedMimeType.startsWith('video/')) {
      maxSize = FILE_CONFIG.VIDEO_SIZE;
    } else {
      throw new BadRequestException(`Unsupported file type: ${detectedMimeType}`);
    }

    if (fileSize > maxSize) {
      throw new BadRequestException('File size exceeds the maximum limit');
    }
  }
}
