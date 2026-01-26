import { ApiProperty } from '@nestjs/swagger';

export class CheckApplicationResponseDto {
  @ApiProperty({ description: '수련회 신청 여부', example: true })
  isApplied: boolean;
}

export class CheckApplicationPaidResponseDto {
  @ApiProperty({ description: '수련회 회비 납부 여부', example: true })
  isPaid: boolean;
}
