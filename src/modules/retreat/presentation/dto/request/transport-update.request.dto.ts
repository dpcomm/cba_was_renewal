import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { TransportCreateRequestDto } from './transport-create.request.dto';

export class TransportUpdateRequestDto extends PartialType(
  OmitType(TransportCreateRequestDto, ['retreatId'] as const),
) {
  @ApiProperty({ description: '교통 옵션 ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  id: number;
}
