import { ShortUser } from '../../../../user/dto/user.dto';

export interface CreateCommentDto {
  commentText: string;
  parentId?: number;
}

export interface GetCommentDto {
  parentId?: number;
}

export interface CommentResponseDto {
  id: number;
  user: ShortUser;
  parentId?: number;
  commentText: string;
  createdAt: Date;
  updatedAt: Date;
  replyCount?: number;
}
