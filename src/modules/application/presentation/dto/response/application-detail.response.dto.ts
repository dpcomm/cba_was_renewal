import { ApiProperty } from '@nestjs/swagger';
import {
  EventResult,
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import {
  ApplicationMealResponseDto,
  ApplicationTransportResponseDto,
  AnswerResponseDto,
} from './application-sub-response.dto';

export class ApplicationDetailResponseDto {
  @ApiProperty({ example: 1, required: true })
  id: number;

  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ example: 'user123', required: true })
  userId: string;

  @ApiProperty({ example: 1, required: true })
  retreatId: number;

  @ApiProperty({
    example: '2025-01-30T10:00:00.000Z',
    required: false,
    nullable: true,
  })
  checkedInAt: Date | null;

  @ApiProperty({ enum: EventResult, required: false, nullable: true })
  eventResult: EventResult | null;

  @ApiProperty({
    example: '2025-01-30T10:05:00.000Z',
    required: false,
    nullable: true,
  })
  eventParticipatedAt: Date | null;

  @ApiProperty({ type: [ApplicationMealResponseDto] })
  applicationMeals: ApplicationMealResponseDto[];

  @ApiProperty({ type: [ApplicationTransportResponseDto] })
  applicationTransports: ApplicationTransportResponseDto[];

  @ApiProperty({ type: [AnswerResponseDto] })
  answers: AnswerResponseDto[];
}
