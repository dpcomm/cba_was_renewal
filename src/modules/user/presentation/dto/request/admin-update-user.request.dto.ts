import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserGender } from '@modules/user/domain/enums/user-gender.enum';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';

export class AdminUpdateUserDto {
  @ApiProperty({ required: false, example: '홍길동' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: UserGroup, example: UserGroup.BRIDGE })
  @IsEnum(UserGroup)
  @IsOptional()
  group?: UserGroup;

  @ApiProperty({ required: false, example: '010-1234-5678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false, example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth?: string;

  @ApiProperty({ required: false, enum: UserGender, example: UserGender.MALE })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @ApiProperty({
    required: false,
    enum: UserRank,
    example: UserRank.ADMIN,
    description: '사용자 등급 (A: 관리자, M: 일반)',
  })
  @IsEnum(UserRank)
  @IsOptional()
  rank?: UserRank;

  @ApiProperty({
    required: false,
    example: 'user@example.com',
    description: '이메일 직접 변경 (관리자 전용, 인증 절차 생략)',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    required: false,
    example: 'newPassword123',
    description: '비밀번호 직접 초기화 (관리자 전용)',
  })
  @IsString()
  @IsOptional()
  password?: string;
}
