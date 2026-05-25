import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ description: '체크인할 사용자의 userId' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '수련회 ID' })
  @IsNumber()
  retreatId: number;
}
