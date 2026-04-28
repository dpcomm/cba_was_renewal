import { ApiProperty } from '@nestjs/swagger';
import {
  ApplicationStatus,
  PaymentStatus,
} from '../../domain/enum/application.enum';

export class ApplicationResponseDto {
  @ApiProperty({ example: 1, required: true })
  id: number;

  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ example: 'userId', required: true })
  userId: string;

  @ApiProperty({ example: 1, required: true })
  retreatId: number;
}
