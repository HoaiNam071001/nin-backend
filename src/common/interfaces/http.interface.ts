import { Request } from 'express';
import { User } from '../../modules/user/entity/user.entity';

export interface AuthRequest extends Request {
  user: User; // Gắn thêm thuộc tính user
}
