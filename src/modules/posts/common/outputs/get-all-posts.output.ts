import { PaginationCursorOutput } from 'src/common/outputs';
import { TGetPost } from 'src/modules/posts/common/types';

export interface GetAllPostsOutput extends PaginationCursorOutput {
  data: TGetPost[];
}
