import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from '../application/auth.service';
import { ok } from '@shared/responses/api-response';
import { LoginDto } from '../application/dto/login.dto';
import { RegisterDto } from '../application/dto/register.dto';
import { RefreshDto } from '../application/dto/refresh.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth.response.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiSuccessResponse({ type: AuthResponseDto })
  @ApiFailureResponse(401, ERROR_MESSAGES.INVALID_PASSWORD)
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  @ApiBody({ type: LoginDto })
  async login(@Req() req, @Body() loginDto: LoginDto) {
    const { autoLogin } = loginDto;
    const result = await this.authService.login(req.user, autoLogin);
    return ok(result, 'Login successful');
  }

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiSuccessResponse({ type: AuthResponseDto })
  @ApiFailureResponse(400, 'User already exists')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return ok(user, 'Register successful');
  }

  @JwtGuard()
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiSuccessResponse({})
  async logout(@Req() req) {
    await this.authService.logout(req.user);
    return ok(null, 'Logout successful');
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiSuccessResponse({ type: AuthResponseDto })
  @ApiFailureResponse(401, 'Invalid refresh token')
  async refresh(@Body() dto: RefreshDto) {
    const result = await this.authService.refresh(dto.refreshToken);
    return ok(result, 'Refresh successful');
  }
}
