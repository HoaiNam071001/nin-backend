import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { User } from '../user/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ header Authorization
      secretOrKey: configService.get<string>('JWT_SECRET'), // Lấy secret từ ConfigService
    });
  }

  async validate(payload: JwtPayload) {
    // Tìm kiếm người dùng bằng ID từ payload
    const user = await this.userService.findById(payload.sub); // sub là ID người dùng
    if (!user) {
      throw new UnauthorizedException(); // Nếu không tìm thấy, ném ra lỗi Unauthorized
    }
    return plainToClass(User, user); // Trả về thông tin người dùng
  }
}
