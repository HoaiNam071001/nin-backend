import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entity/user.entity';
import { SignupDto } from './dto/signup.dto';
import { JwtPayload } from './jwt-payload.interface';
import { AuthResponseDto } from './dto/response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: SigninDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Tìm người dùng theo email
    const user: User = await this.userService.findByEmail(email);

    // Kiểm tra mật khẩu
    if (!user || !(await this.validatePassword(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo và trả về token
    const payload = { email: user.email, sub: user.id }; // sub thường là ID người dùng
    return {
      token: this.jwtService.sign(payload),
      user: user,
    };
  }
  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email } = signupDto;

    // Kiểm tra xem email đã tồn tại hay chưa
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Tạo người dùng mới
    const { firstName, lastName } = signupDto;
    signupDto.fullName = `${firstName} ${lastName}`;
    const user = await this.userService.create(signupDto);
    const payload: JwtPayload = { email: user.email, sub: user.id }; // sub thường là ID người dùng

    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
}
