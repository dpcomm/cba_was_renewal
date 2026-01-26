import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryResponseDto {
  @ApiProperty({ example: 12, nullable: true })
  retreatId: number | null;

  @ApiProperty({
    example: 320,
    description: 'Total user count (excluding deleted users)',
  })
  totalCount: number;

  @ApiProperty({ example: 120, description: 'Application count for retreat' })
  appliedCount: number;

  @ApiProperty({ example: 98, description: 'feePaid count for retreat' })
  feePaidCount: number;

  @ApiProperty({ example: 76, description: 'attended count for retreat' })
  attendedCount: number;

  @ApiProperty({
    example: [
      [60, 70, 80],
      [55, 65, 75],
      [50, 60, 70],
    ],
    description:
      'Meal counts by day: [day1, day2, day3], each [breakfast, lunch, dinner]',
  })
  mealStats: number[][];
}

export class DashboardGroupStatResponseDto {
  @ApiProperty({ example: '새친구' })
  group: string;

  @ApiProperty({ example: 24, description: 'Total user count for group (excluding deleted users)' })
  totalCount: number;

  @ApiProperty({ example: 10, description: 'Application count for retreat in group' })
  appliedCount: number;

  @ApiProperty({ example: 8, description: 'feePaid count for retreat in group' })
  feePaidCount: number;

  @ApiProperty({ example: 6, description: 'attended count for retreat in group' })
  attendedCount: number;
}
