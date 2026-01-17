import { ApiProperty } from '@nestjs/swagger';

export class FindIdResponseDto {
  @ApiProperty({
    example: 'te*****23',
    description: '마스킹된 사용자 아이디',
  })
  userId: string;
}
