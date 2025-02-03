import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.login(signinDto);
  }

  @Post('signup')
  async signup(@Body() createUserDto: SignupDto) {
    return this.authService.signup(createUserDto);
  }

  @Put('change-password/:id')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() { password }: { password: string },
  ) {
    if (!password) {
      return;
    }
    return this.authService.changePass(id, password);
  }
}
