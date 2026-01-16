import { LectureSemester } from "@modules/lecture/domain/lecture-semester.enum";
import { ApiProperty } from "@nestjs/swagger";

export class LectureResponseDto {  

    @ApiProperty({example: 1, required: true})
    id: number;

    @ApiProperty({example: 'test lecture title', required: true})
    title: string;
    
    @ApiProperty({example: 'test lecture instructor name', required: true})
    instructorName: string;
    
    @ApiProperty({example: 'test lecture location', required: true})
    location: string;
    
    @ApiProperty({example: "2025-12-01T08:30:00.000Z", format: "date-time", required: true})
    startTime: string;
    
    @ApiProperty({example: 12, required: true})
    currentCount: number;
    
    @ApiProperty({example: 30, required: true})
    maxCapacity: number;

    @ApiProperty({example: 2026, required: true})
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
    semester: string;
    
    @ApiProperty({example: '001', required: true})
    codeNumber: string;

    @ApiProperty({example: 'test lecture introduction', required: true})
    introduction: string;    
}

export type LectureListResponse = LectureResponseDto[];
export type LectureSingleResponse = LectureResponseDto | null;

export class LectureEnrolleeDto {
    
    @ApiProperty({example: 256, required: true})
    id: number;
    
    @ApiProperty({example: 'test enrollee name', required: true})
    name: string;
    
    @ApiProperty({example: 'test group'})
    group: string;
} 

export class LectureDetailResponseDto {
    
    @ApiProperty({example: 1, required: true})
    id: number;

    @ApiProperty({example: 'test lecture title', required: true})
    title: string;
    
    @ApiProperty({example: 'test lecture instructor name', required: true})
    instructorName: string;
    
    @ApiProperty({example: 'test lecture location', required: true})
    location: string;
    
    @ApiProperty({example: "2025-12-01T08:30:00.000Z", format: "date-time", required: true})
    startTime: string;
    
    @ApiProperty({example: 12, required: true})
    currentCount: number;
    
    @ApiProperty({example: 30, required: true})
    maxCapacity: number;

    @ApiProperty({example: 2026, required: true})
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
    semester: string;

    @ApiProperty({example: '001', required: true})
    codeNumber: string;

    @ApiProperty({example: 'test lecture introduction', required: true})
    introduction: string;

    @ApiProperty({ type: LectureEnrolleeDto, isArray: true, required: true})
    enrollees: LectureEnrolleeDto[];
}

export type LectureDetailListResponse = LectureDetailResponseDto[];
export type LectureDetailSingleResponse = LectureDetailResponseDto | null;