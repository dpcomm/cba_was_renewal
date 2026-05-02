import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ example: 12, required: true })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]', required: true })
  @IsString()
  token: string;
}

export class DeletePushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]' })
  @IsString()
  token: string;
}
