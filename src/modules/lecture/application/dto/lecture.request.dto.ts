import { LectureSemester } from '@modules/lecture/domain/lecture-semester.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class getLectureFilterDto {

    @ApiProperty({example: 2026, required: false})
    @IsOptional()
    @IsInt()
    year?: number;

    @ApiProperty({
        enum: LectureSemester, 
        example: LectureSemester.WINTER_RETREAT, 
        required: false,
        description: `
            약어 설명:
            • WIR = 겨울수련회
            • SUR = 여름수련회  
            • SPG = 봄 GBS
            • SUG = 여름 GBS
            • AUG = 가을 GBS
            • WIG = 겨울 GBS
            • ES1, ES2, ES3, ES4 = 추가학기 1,2,3,4
        `.trim(),
    })
    @IsOptional()
    @IsEnum(LectureSemester)    
    semester?: LectureSemester;

    @ApiProperty({example: '001', required: false})
    @IsOptional()
    @IsString()
    codeNumber?: string;
}

export class createLectureRequestDto {
    
    @ApiProperty({example: 'test lecture title', required: true})
    @IsString()
    title: string;
    
    @ApiProperty({example: 'test lecture introduction', required: true})
    @IsString()
    introduction: string;

    @ApiProperty({example: 'test lecture instructor', required: true})
    @IsString()
    instructor: string;

    @ApiProperty({example: 'test lecture location', required: true})
    @IsString()
    location: string;

    @ApiProperty({example: 30, required: true})
    @IsInt()
    maxCapacity: number;

    @ApiProperty({example: "2025-12-01T08:30:00.000Z", format: "date-time", required: true})
    @IsDateString()
    startTime: string;

    @ApiProperty({example: 2026, required: true})
    @IsInt()
    year: number;

    @ApiProperty({
        enum: LectureSemester, 
        example: LectureSemester.WINTER_RETREAT, 
        required: true,
        description: `
            약어 설명:
            • WIR = 겨울수련회
            • SUR = 여름수련회  
            • SPG = 봄 GBS
            • SUG = 여름 GBS
            • AUG = 가을 GBS
            • WIG = 겨울 GBS
            • ES1, ES2, ES3, ES4 = 추가학기 1,2,3,4
        `.trim(),
    })
    @IsEnum(LectureSemester)
    semester: LectureSemester;
}

export class updateLectureRequestDto {
    @ApiProperty({example: 1, required: true})
    @IsInt()
    id: number;

    @ApiProperty({example: 'test lecture title', required: false})
    @IsOptional()
    @IsString()
    title?: string;
    
    @ApiProperty({example: 'test lecture introduction', required: false})
    @IsOptional()
    @IsString()
    introduction?: string;

    @ApiProperty({example: 'test lecture instructor', required: false})
    @IsOptional()
    @IsString()
    instructor?: string;

    @ApiProperty({example: 'test lecture location', required: false})
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({example: 30, required: false})
    @IsOptional()
    @IsInt()
    maxCapacity?: number;

    @ApiProperty({example: "2025-12-01T08:30:00.000Z", format: "date-time", required: false})
    @IsOptional()
    @IsDateString()
    startTime?: string;
}

export class enrollLectureRequestDto{
    @ApiProperty({example: 1, required: true})
    userId: number;
    
    @ApiProperty({example: 1, required: true})
    lectureId: number;
}

export class dropLectureRequestDto {
    @ApiProperty({example: 1, required: true})
    userId: number;

    @ApiProperty({example: 1, required: true})
    lectureId: number;
}