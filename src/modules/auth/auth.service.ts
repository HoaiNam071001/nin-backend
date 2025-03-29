import {
  BadRequestException,
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
import { plainToClass } from 'class-transformer';
import { UserDto } from '../user/dto/user.dto';

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

    if (!user.active) {
      throw new UnauthorizedException('User is not active');
    }

    // Tạoput và trả về token
    const payload: JwtPayload = { sub: user.id }; // sub thường là ID người dùng
    return {
      token: this.jwtService.sign(payload),
      user: plainToClass(UserDto, user),
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
    // const { firstName, lastName } = signupDto;
    // signupDto.fullName = `${firstName} ${lastName}`;
    const user = await this.userService.create(signupDto);
    const payload: JwtPayload = { sub: user.id }; // sub thường là ID người dùng

    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }

  async changePass(id: number, password: string) {
    const existingUser = await this.userService.findById(id);
    if (!existingUser) {
      throw new BadRequestException('');
    }
    existingUser.password = await bcrypt.hash(password, 10);
    const user = await this.userService.update(id, {
      password: existingUser.password,
    });
    return user;
  }
}
