import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]', required: true })
  @IsString()
  token: string;
}

export class DeletePushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]' })
  @IsString()
  token: string;
}
