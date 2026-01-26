import { EventResult } from '@modules/application/domain/enum/application.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationDetailResponseDto {
  @ApiProperty({ example: 1, required: true })
  id: number;

  @ApiProperty({ example: 'abc123', required: true })
  idn: string;

  @ApiProperty({ example: true, required: true })
  attended: boolean;

  @ApiProperty({ example: true, required: true })
  feePaid: boolean;

  @ApiProperty({ example: 'user123', required: true })
  userId: string;

  @ApiProperty({ example: 1, required: true })
  retreatId: number;

  @ApiProperty({
    example: '2025-01-30T10:00:00.000Z',
    required: false,
    nullable: true,
  })
  checkedInAt: Date | null;

  @ApiProperty({ example: 'admin1', required: false, nullable: true })
  checkedInBy: string | null;

  @ApiProperty({ enum: EventResult, required: false, nullable: true })
  eventResult: EventResult | null;

  @ApiProperty({
    example: '2025-01-30T10:05:00.000Z',
    required: false,
    nullable: true,
  })
  eventParticipatedAt: Date | null;
}
