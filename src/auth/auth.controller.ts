import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';

/**
 * 🏗 Controller — handles HTTP routing only, delegates logic to AuthService
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** POST /auth/register */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /auth/login → returns { access_token } */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
