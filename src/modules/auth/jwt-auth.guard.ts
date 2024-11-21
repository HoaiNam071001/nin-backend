import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    // Lấy đối tượng yêu cầu từ ExecutionContext
    // const request = context.switchToHttp().getRequest();

    // // Ghi lại thông tin yêu cầu vào console
    // const authHeader = request.headers['authorization'];
    // console.log('Request:', authHeader); // Hoặc request.user, request.headers, v.v.

    // Gọi phương thức canActivate của AuthGuard
    return super.canActivate(context) as boolean;
  }
}
