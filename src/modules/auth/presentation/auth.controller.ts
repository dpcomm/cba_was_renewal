import { Controller, Post, UseGuards, Req, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { AuthService } from '../application/auth.service';
import { ok } from '@shared/responses/api-response';
import { LoginDto } from '../application/dto/login.dto';
import { RegisterDto } from '../application/dto/register.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiTags, ApiOperation, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth.response.dto';
import { RefreshResponseDto } from './dto/refresh.response.dto';
import { UserResponseDto } from '@modules/user/presentation/dto/user.response.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: '로그인' })
  @ApiSuccessResponse({ type: AuthResponseDto })
  @ApiFailureResponse(401, ERROR_MESSAGES.INVALID_CREDENTIALS)
  @ApiBody({ type: LoginDto })
  async login(@Req() req) {
    const result = await this.authService.login(req.user);
    return ok(result, 'Login successful');
  }

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiSuccessResponse({ type: UserResponseDto })
  @ApiFailureResponse(400, ERROR_MESSAGES.USER_ALREADY_EXISTS)
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return ok(user, 'Register successful');
  }

  @Post('logout')
  @JwtGuard()
  @ApiOperation({ summary: '로그아웃' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(401, ERROR_MESSAGES.USER_NOT_FOUND)
  async logout(@Req() req) {
    await this.authService.logout(req.user);
    return ok(null, 'Logout successful');
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiHeader({ name: 'authorization', description: 'Bearer <refresh_token>' })
  @ApiSuccessResponse({ type: RefreshResponseDto })
  @ApiFailureResponse(401, ERROR_MESSAGES.INVAILD_REFRESH_TOKEN)
  async refresh(@RefreshToken() refreshToken: string) {
    const result = await this.authService.refresh(refreshToken);
    return ok(result, 'Refresh successful');
  }

  @Post('email/verify')
  @ApiOperation({ summary: '이메일 인증 코드 확인' })
  @ApiSuccessResponse({ type: Boolean })
  @ApiFailureResponse(400, ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID)
  @ApiFailureResponse(400, ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED)
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.email, dto.code);
    return ok(true, 'Email verification successful');
  }

  @Get('mail/:email')
  @ApiOperation({ summary: '이메일 인증 코드 발송' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(500, ERROR_MESSAGES.FAILED_TO_SEND_EMAIL)
  async sendEmail(@Param('email') email: string) {
    await this.authService.sendEmail(email);
    return ok(null, 'Email verification code sent successfully');
  }
  
}
