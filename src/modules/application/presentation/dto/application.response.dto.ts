import { ApiProperty } from "@nestjs/swagger";

export class ApplicationResponseDto {
    @ApiProperty({example: 1, required: true})
    id: number;

    @ApiProperty({example: 'idn', required: true})
    idn: string;

    @ApiProperty({example: true, required: true})
    attended: boolean;

    @ApiProperty({example: true, required: true})
    feePaid: boolean;

    @ApiProperty({example: 'userId', required: true})
    userId: string;

    @ApiProperty({example: 1, required: true})
    retreatId: number;
}