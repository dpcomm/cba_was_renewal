import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetDashboardSummaryRequestDto {
  @ApiPropertyOptional({
    example: 12,
    description: 'Retreat id. If omitted, uses latest retreat id.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  retreatId?: number;
}
