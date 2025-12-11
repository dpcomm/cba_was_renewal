import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from '../application/auth.service';
import { ok } from '@shared/responses/api-response';
import { LoginDto } from '../application/dto/login.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth.response.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiSuccessResponse({ type: AuthResponseDto })
  @ApiFailureResponse(401, 'Invalid password')
  @ApiFailureResponse(404, 'User not found')
  @ApiBody({ type: LoginDto })
  async login(@Req() req, @Body() loginDto: LoginDto) {
    const { autoLogin } = loginDto;
    const result = await this.authService.login(req.user, autoLogin);
    return ok(result, 'Login successful');
  }
}
