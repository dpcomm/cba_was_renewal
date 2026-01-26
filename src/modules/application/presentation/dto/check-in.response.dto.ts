import { ApiProperty } from '@nestjs/swagger';

export class CheckInResponseDto {
  @ApiProperty({
    description: '체크인 시간',
    example: '2025-01-30T10:00:00.000Z',
  })
  checkedInAt: Date;
}
