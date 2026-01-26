import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlayEventDto {
  @ApiProperty({ description: '수련회 ID' })
  @IsNumber()
  retreatId: number;
}
