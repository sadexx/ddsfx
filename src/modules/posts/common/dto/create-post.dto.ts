import { Type } from '@sinclair/typebox';
import { ExtendedStringPattern, UUIDPattern } from 'src/common/validators';
import { FILE_CONFIG } from 'src/libs/file-management/common/constants';
import { CreatePostMediaContentDto } from 'src/modules/posts/common/dto/create-post-media-content.dto';

export class CreatePostDto {
  replyToPostId?: string;
  text?: string;
  mediaContent?: CreatePostMediaContentDto[];

  static readonly schema = Type.Object(
    {
      replyToPostId: Type.Optional(UUIDPattern),
      text: Type.Optional(ExtendedStringPattern),
      mediaContent: Type.Optional(
        Type.Array(CreatePostMediaContentDto.schema, { minItems: 1, maxItems: FILE_CONFIG.MAX_FILES }),
      ),
    },
    { additionalProperties: false },
  );
}
