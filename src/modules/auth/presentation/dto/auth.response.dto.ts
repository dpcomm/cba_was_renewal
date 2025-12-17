import { User } from '@modules/user/domain/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  access_token: string;

  @ApiProperty({ description: 'JWT Refresh Token', required: false, nullable: true })
  refresh_token: string | null;

  @ApiProperty({ description: 'User Data' })
  user: Omit<User, 'password'>;
}
