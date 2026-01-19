import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty({ description: 'New JWT Access Token' })
  access_token: string;
}
