import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]', required: true })
  @IsString()
  token!: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  userId?: number;
}

export class DeletePushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]' })
  @IsString()
  token!: string;
}
