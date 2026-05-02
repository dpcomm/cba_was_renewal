import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AdminUserListQueryDto {
  @ApiProperty({
    required: false,
    description: '이름/아이디/소속/전화번호 통합 검색',
    example: '홍길동',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, default: 1, description: '페이지 번호' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 20,
    description: '페이지당 항목 수',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    required: false,
    default: false,
    description: '탈퇴(비활성) 사용자 포함 여부',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean = false;
}
