import { ApiProperty } from '@nestjs/swagger';

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
}
