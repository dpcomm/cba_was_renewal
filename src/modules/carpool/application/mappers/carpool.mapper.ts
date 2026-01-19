import { Injectable } from '@nestjs/common';
import { CarpoolRoom } from '../../domain/entities/carpool-room.entity';
import {
    CarpoolResponseDto,
    CarpoolListResponse,
    CarpoolSingleResponse
} from '../../presentation/dto/carpool.response.dto';

@Injectable()
export class CarpoolMapper {
    
    toResponse(carpool: CarpoolRoom): CarpoolResponseDto {
        return {
            id: carpool.id,
            driverId: carpool.driverId,
            carInfo: carpool.carInfo ?? null,
            departureTime: carpool.departureTime.toISOString(),
            origin: carpool.origin,
            originDetailed: carpool.originDetailed ?? null,
            destination: carpool.destination,
            destinationDetailed: carpool.destinationDetailed ?? null,
            seatsTotal: carpool.seatsTotal,
            seatsLeft: carpool.seatsLeft,
            note: carpool.note,
            originLat: carpool.originLat ?? null,
            originLng: carpool.originLng ?? null,
            destLat: carpool.destLat ?? null,
            destLng: carpool.destLng ?? null,
            status: carpool.status,
            isArrived: carpool.isArrived,
            createdAt: carpool.createdAt.toISOString(),
            updatedAt: carpool.updatedAt.toISOString(),
        };
    }

    toResponseList(carpools: CarpoolRoom[]): CarpoolListResponse {
        return carpools.map((carpool) => this.toResponse(carpool));
    }

    toResponseOrNull(carpool: CarpoolRoom | null) : CarpoolSingleResponse {
        return carpool ? this.toResponse(carpool) : null;
    }

}