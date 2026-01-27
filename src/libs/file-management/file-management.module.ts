import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/libs/file-management/entities';
import { AwsS3Module } from 'src/libs/aws/s3/aws-s3.module';
import { CloudFrontModule } from 'src/libs/aws/cloud-front/cloud-front.module';
import { FileManagementController } from 'src/libs/file-management/controllers';
import { FileHandlerService, FileManagementService } from 'src/libs/file-management/services';
import { FileUploadService } from 'src/libs/file-management/common/upload-strategies';
import { UserAvatar } from 'src/modules/users/entities';

@Module({
  imports: [TypeOrmModule.forFeature([File, UserAvatar]), AwsS3Module, CloudFrontModule],
  controllers: [FileManagementController],
  providers: [FileUploadService, FileManagementService, FileHandlerService],
})
export class FileManagementModule {}
