import { UserGender } from '@modules/user/domain/enums/user-gender.enum';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'testuser' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '배윤희&김준영' })
  @IsString()
  @IsNotEmpty()
  group: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false, example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth?: Date;

  @ApiProperty({ required: false, example: 'male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ required: false, example: 'M' })
  @IsString()
  @IsOptional()
  rank?: string;
}
