import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '@modules/user/presentation/dto/user.response.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  access_token: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refresh_token: string;

  @ApiProperty({ description: 'User Data', type: UserResponseDto })
  user: UserResponseDto;
}
