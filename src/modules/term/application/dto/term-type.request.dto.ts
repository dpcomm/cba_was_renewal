import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class createTermTypeRequestDto {
    @ApiProperty({ example: '겨울수련회', required: true })
    @IsString()
    name: string;
}