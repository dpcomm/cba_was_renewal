import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { UserGender } from '@modules/user/domain/enums/user-gender.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';

export class UpdateUserDto {
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
    example: 'newPassword123',
    description: '새 비밀번호',
  })
  @IsString()
  @IsOptional()
  password?: string;
}
