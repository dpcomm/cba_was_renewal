import { ApiProperty } from '@nestjs/swagger';
import { EventResult } from '@modules/application/domain/enum/application.enum';

export class AdminApplicationListResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  group: string;

  @ApiProperty()
  feePaid: boolean;

  @ApiProperty({ nullable: true })
  checkedInAt: Date | null;

  @ApiProperty({ enum: EventResult, nullable: true })
  eventResult: EventResult | null;
}
