import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { UserGender } from '@modules/user/domain/enums/user-gender.enum';

export class UpdateUserDto {
  @ApiProperty({ required: false, example: '홍길동' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, example: '배윤희&김준영' })
  @IsString()
  @IsOptional()
  group?: string;

  @ApiProperty({ required: false, example: '010-1234-5678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false, example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birth?: Date;

  @ApiProperty({ required: false, enum: UserGender, example: UserGender.MALE })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;
}
