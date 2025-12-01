export interface CreateCarpoolDto {
  driverId: number;
  carInfo: string;
  departureTime: Date;
  origin: string;
  originDetailed?: string | null;
  destination: string;
  destinationDetailed?: string | null;
  seatsTotal: number;
  note: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export interface UpdateCarpoolInfoDto extends Partial<CreateCarpoolDto> {
  carpoolId: number;
  driverId: number;
  carInfo: string;
  departureTime: Date;
  origin: string;
  originDetailed?: string | null;
  destination: string;
  destinationDetailed?: string | null;
  seatsTotal: number;
  seatsLeft: number;  
  isArrived: boolean;        
  note: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export interface UpdateCarpoolDto extends Partial<CreateCarpoolDto> {
  seatsLeft: number;
  isArrived: boolean;
}

export interface CarpoolUserInfoDto {
  userId: number;
  name: string;
  phone: string;
}

export interface CarpoolRoomDetailDto {
  id: number;
  driverId: number;
  carInfo: string | null;
  departureTime: Date;
  origin: string;
  originDetailed: string | null;
  destination: string;
  destinationDetailed: string | null;
  seatsTotal: number;
  seatsLeft: number;
  note: string;
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
  isArrived: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  driver: {
    id: number;
    name: string;
    phone: string;
  };
  members: CarpoolUserInfoDto[];
}