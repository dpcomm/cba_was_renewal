import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindIdDto {
  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '사용자 전화번호',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
