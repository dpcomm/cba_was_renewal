import { ApiProperty } from '@nestjs/swagger';
import {
  EventResult,
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';

export class AdminApplicationListItemResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: UserGroup })
  group: UserGroup;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiProperty({ nullable: true })
  checkedInAt: Date | null;

  @ApiProperty({ enum: EventResult, nullable: true })
  eventResult: EventResult | null;
}

export class AdminApplicationListMetaResponseDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrev: boolean;
}

export class AdminApplicationListResponseDto {
  @ApiProperty({ type: [AdminApplicationListItemResponseDto] })
  items: AdminApplicationListItemResponseDto[];

  @ApiProperty({ type: AdminApplicationListMetaResponseDto })
  meta: AdminApplicationListMetaResponseDto;
}
