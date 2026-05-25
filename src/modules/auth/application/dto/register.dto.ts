import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';

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

  @ApiProperty({
    enum: UserGroup,
    example: UserGroup.BAE_YOON_HEE_AND_KIM_JUN_YOUNG_M,
  })
  @IsEnum(UserGroup)
  @IsNotEmpty()
  group: UserGroup;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '인증된 이메일 주소',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1...',
    description: '이메일 인증 후 발급받은 토큰',
  })
  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @ApiProperty({ required: false, example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth?: string;

  @ApiProperty({ required: false, example: 'male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ required: false, example: 'M' })
  @IsString()
  @IsOptional()
  rank?: string;
}
