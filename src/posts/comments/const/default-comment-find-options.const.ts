import { FindManyOptions } from 'typeorm';
import { CommentsModel } from '../entity/comments.entity';

export const DEFAULT_COMMENT_FIND_OPTIONS: FindManyOptions<CommentsModel> = {
  relations: {
    author: true,
  },
  select: {
    // relation: author 에서도 전부 다 가져오지 않고, id와 nickname만 가져옴.
    author: {
      id: true,
      nickname: true,
    },
  },
};
