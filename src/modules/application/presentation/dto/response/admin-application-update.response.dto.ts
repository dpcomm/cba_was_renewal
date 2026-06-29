import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateAdminApplicationResult } from '@modules/application/application/usecases/admin/update-admin-application.usecase';

export class AdminApplicationTransportSelectionResponseDto {
  @ApiProperty({ example: 1 })
  retreatTransportId: number;

  @ApiProperty({ enum: TransportDirection })
  direction: TransportDirection;

  @ApiProperty({ nullable: true, example: null })
  vehicleNumber: string | null;

  @ApiProperty({ nullable: true, example: null })
  remark: string | null;

  constructor(params: AdminApplicationTransportSelectionResponseDto) {
    Object.assign(this, params);
  }
}

export class AdminApplicationUpdateResponseDto {
  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3] })
  retreatMealIds?: number[];

  @ApiPropertyOptional({
    type: [AdminApplicationTransportSelectionResponseDto],
  })
  transports?: AdminApplicationTransportSelectionResponseDto[];

  @ApiPropertyOptional({ enum: PaymentStatus })
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ enum: ApplicationStatus })
  applicationStatus?: ApplicationStatus;

  @ApiPropertyOptional({ nullable: true, example: '2026-04-20T09:15:00.000Z' })
  checkedInAt?: Date | null;

  constructor(result: UpdateAdminApplicationResult) {
    this.retreatMealIds = result.retreatMealIds;
    this.transports = result.transports?.map(
      (transport) =>
        new AdminApplicationTransportSelectionResponseDto(transport),
    );
    this.paymentStatus = result.paymentStatus;
    this.applicationStatus = result.applicationStatus;
    this.checkedInAt = result.checkedInAt;
  }
}
