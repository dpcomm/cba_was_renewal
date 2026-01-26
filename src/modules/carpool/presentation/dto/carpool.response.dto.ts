import { ApiProperty } from '@nestjs/swagger';
import { CarpoolStatus } from '../../domain/carpool-status.enum';

export class CarpoolResponseDto {
  @ApiProperty({ example: 12, required: true })
  id: number;

  @ApiProperty({ example: 5, required: true })
  driverId: number;

  @ApiProperty({ example: 'HYUNDAI Avante - Blue', nullable: true })
  carInfo: string | null;

  @ApiProperty({
    example: '2025-12-01T08:30:00.000Z',
    format: 'date-time',
    required: true,
  })
  departureTime: string;

  @ApiProperty({ example: '서울특별시 강남구 삼성역', required: true })
  origin: string;

  @ApiProperty({ example: '2번 출구', nullable: true })
  originDetailed: string | null;

  @ApiProperty({ example: '경기도 용인시 죽전역', required: true })
  destination: string;

  @ApiProperty({ example: '1번 출구', nullable: true })
  destinationDetailed: string | null;

  @ApiProperty({ example: 4, required: true })
  seatsTotal: number;

  @ApiProperty({ example: 2, required: true })
  seatsLeft: number;

  @ApiProperty({ example: '탐승 전 5분 전에 도착해주세요.', required: true })
  note: string;

  @ApiProperty({
    example: 37.5,
    type: Number,
    format: 'double',
    nullable: true,
  })
  originLat: number | null;

  @ApiProperty({
    example: 127.0,
    type: Number,
    format: 'double',
    nullable: true,
  })
  originLng: number | null;

  @ApiProperty({
    example: 37.3,
    type: Number,
    format: 'double',
    nullable: true,
  })
  destLat: number | null;

  @ApiProperty({
    example: 127.1,
    type: Number,
    format: 'double',
    nullable: true,
  })
  destLng: number | null;

  @ApiProperty({ example: CarpoolStatus.In_Transit, required: true })
  status: CarpoolStatus;

  @ApiProperty({ example: false, required: true })
  isArrived: boolean;

  @ApiProperty({
    example: '2025-11-30T09:12:33.123Z',
    format: 'date-time',
    required: true,
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-11-30T10:15:21.789Z',
    format: 'date-time',
    required: true,
  })
  updatedAt: string;
}

export type CarpoolListResponse = CarpoolResponseDto[];
export type CarpoolSingleResponse = CarpoolResponseDto | null;

export class CarpoolDriverInfoDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'testDriver' })
  name: string;

  @ApiProperty({ example: '010-9876-5432' })
  phone: string;
}

export class CarpoolUserInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'testuser' })
  name: string;

  @ApiProperty({ example: '010-1234-5678' })
  phone: string;
}

export class CarpoolDetailResponseDto {
  @ApiProperty({ example: 12, required: true })
  id: number;

  @ApiProperty({ example: 5, required: true })
  driverId: number;

  @ApiProperty({ example: 'HYUNDAI Avante - Blue', nullable: true })
  carInfo: string | null;

  @ApiProperty({
    example: '2025-12-01T08:30:00.000Z',
    format: 'date-time',
    required: true,
  })
  departureTime: string;

  @ApiProperty({ example: '서울특별시 강남구 삼성역', required: true })
  origin: string;

  @ApiProperty({ example: '2번 출구', nullable: true })
  originDetailed: string | null;

  @ApiProperty({ example: '경기도 용인시 죽전역', required: true })
  destination: string;

  @ApiProperty({ example: '1번 출구', nullable: true })
  destinationDetailed: string | null;

  @ApiProperty({ example: 4, required: true })
  seatsTotal: number;

  @ApiProperty({ example: 2, required: true })
  seatsLeft: number;

  @ApiProperty({ example: '탐승 전 5분 전에 도착해주세요.', required: true })
  note: string;

  @ApiProperty({
    example: 37.5,
    type: Number,
    format: 'double',
    nullable: true,
  })
  originLat: number | null;

  @ApiProperty({
    example: 127.0,
    type: Number,
    format: 'double',
    nullable: true,
  })
  originLng: number | null;

  @ApiProperty({
    example: 37.3,
    type: Number,
    format: 'double',
    nullable: true,
  })
  destLat: number | null;

  @ApiProperty({
    example: 127.1,
    type: Number,
    format: 'double',
    nullable: true,
  })
  destLng: number | null;

  @ApiProperty({ example: CarpoolStatus.In_Transit, required: true })
  status: CarpoolStatus;

  @ApiProperty({ example: false, required: true })
  isArrived: boolean;

  @ApiProperty({
    example: '2025-11-30T09:12:33.123Z',
    format: 'date-time',
    required: true,
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-11-30T10:15:21.789Z',
    format: 'date-time',
    required: true,
  })
  updatedAt: string;

  @ApiProperty({
    type: CarpoolDriverInfoDto,
    example: { id: 2, name: 'testDriver', phone: '010-9876-5432' },
  })
  driver: CarpoolDriverInfoDto;

  @ApiProperty({ type: CarpoolUserInfoDto, isArray: true })
  members: CarpoolUserInfoDto[];
}
export type carpoolDetailSingleResponse = CarpoolDetailResponseDto | null;

export class CarpoolWithDriverInfoResponseDto {
  @ApiProperty({ example: 12, required: true })
  id: number;

  @ApiProperty({ example: 5, required: true })
  driverId: number;

  @ApiProperty({ example: 'HYUNDAI Avante - Blue', nullable: true })
  carInfo: string | null;

  @ApiProperty({
    example: '2025-12-01T08:30:00.000Z',
    format: 'date-time',
    required: true,
  })
  departureTime: string;

  @ApiProperty({ example: '서울특별시 강남구 삼성역', required: true })
  origin: string;

  @ApiProperty({ example: '2번 출구', nullable: true })
  originDetailed: string | null;

  @ApiProperty({ example: '경기도 용인시 죽전역', required: true })
  destination: string;

  @ApiProperty({ example: '1번 출구', nullable: true })
  destinationDetailed: string | null;

  @ApiProperty({ example: 4, required: true })
  seatsTotal: number;

  @ApiProperty({ example: 2, required: true })
  seatsLeft: number;

  @ApiProperty({ example: '탐승 전 5분 전에 도착해주세요.', required: true })
  note: string;

  @ApiProperty({
    example: 37.5,
    type: Number,
    format: 'double',
    nullable: true,
  })
  originLat: number | null;

  @ApiProperty({
    example: 127.0,
    type: Number,
    format: 'double',
    nullable: true,
  })
  originLng: number | null;

  @ApiProperty({
    example: 37.3,
    type: Number,
    format: 'double',
    nullable: true,
  })
  destLat: number | null;

  @ApiProperty({
    example: 127.1,
    type: Number,
    format: 'double',
    nullable: true,
  })
  destLng: number | null;

  @ApiProperty({ example: CarpoolStatus.In_Transit, required: true })
  status: CarpoolStatus;

  @ApiProperty({ example: false, required: true })
  isArrived: boolean;

  @ApiProperty({
    example: '2025-11-30T09:12:33.123Z',
    format: 'date-time',
    required: true,
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-11-30T10:15:21.789Z',
    format: 'date-time',
    required: true,
  })
  updatedAt: string;

  @ApiProperty({
    type: CarpoolDriverInfoDto,
    example: { id: 2, name: 'testDriver', phone: '010-9876-5432' },
  })
  driver: CarpoolDriverInfoDto;
}
export type CarpoolWithDriverInfoListResponse =
  CarpoolWithDriverInfoResponseDto[];
export type carpoolWithDriverInfoSingleResponse =
  CarpoolWithDriverInfoResponseDto | null;
