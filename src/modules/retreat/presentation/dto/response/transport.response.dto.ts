import { ApiProperty } from '@nestjs/swagger';
import { RetreatTransport } from '../../../domain/entities/retreat_transport.entity';
import { TransportDirection, TransportType } from '../../../domain/enum/retreat-transport.enum';

export class TransportResponseDto {
  @ApiProperty({ description: '교통 옵션 ID' })
  id: number;

  @ApiProperty({ description: '수련회 ID' })
  retreatId: number;

  @ApiProperty({ description: '방향', enum: TransportDirection })
  direction: TransportDirection;

  @ApiProperty({ description: '수단', enum: TransportType })
  transportType: TransportType;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '차량번호 필수 여부' })
  isVehicleRequired: boolean;

  @ApiProperty({ description: '비고 필수 여부' })
  isRemarkRequired: boolean;

  @ApiProperty({ description: '신청 인원' })
  applicantCount: number;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  constructor(entity: RetreatTransport & { applicantCount?: number }) {
    this.id = entity.id;
    this.retreatId = entity.retreatId;
    this.direction = entity.direction;
    this.transportType = entity.transportType;
    this.name = entity.name;
    this.isRemarkRequired = entity.isRemarkRequired;
    this.isVehicleRequired = entity.isVehicleRequired;
    this.applicantCount = Number(entity.applicantCount || 0);
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
