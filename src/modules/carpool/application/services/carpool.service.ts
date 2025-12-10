import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, DataSource } from 'typeorm';
import { CarpoolRoom } from '../../domain/entities/carpool-room.entity';
import { CarpoolMember } from '@modules/carpool/domain/entities/carpool-member.entity';
import { 
    createCarpoolRequestDto, 
    updateCarpoolRequestDto, 
    updateCarpoolstatusRequestDto, 
    participationCarpoolRequestDto 
} from '../dto/carpool.request.dto';
import { User } from '@modules/user/domain/entities/user.entity';
import { CarpoolStatus } from '@modules/carpool/domain/carpool-status.enum';
// fcmservice
// redis


@Injectable() 
export class CarpoolService {
    constructor(
        @InjectRepository(CarpoolRoom)
        private carpoolRoomRepository: Repository<CarpoolRoom>,
        @InjectRepository(CarpoolMember)
        private carpoolMemberRepository: Repository<CarpoolMember>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
    ) {}

    async getAllCarpoolRooms(): Promise<CarpoolRoom[]> {
        return await this.carpoolRoomRepository
            .createQueryBuilder('carpool')
            .leftJoin('carpool.driver', 'driver')
            .select([
                'carpool',
                'driver.id',
                'driver.name',
            ])
            .orderBy('carpool.createdAt', 'DESC')
            .getMany();
    }

    async getCarpoolRoomById( id: number ): Promise<CarpoolRoom | null> {
        return await this.carpoolRoomRepository
            .createQueryBuilder('carpool')    

            // driver
            .leftJoin('carpool.driver', 'driver')
            // members -> user
            .leftJoin('carpool.members', 'member')
            .leftJoin('member.user', 'memberUser')
            // chats -> sender
            .leftJoin('carpool.chats', 'chat')
            .leftJoin('chat.sender', 'sender')

            // WHERE
            .where('carpool.id = :id', { id })

            // SELECT
            .select([
                'carpool',                   // CarpoolRoom 전체
                'driver.id',
                'driver.name',
                'driver.phone',
                'member',                    // members 전체
                'memberUser.id',
                'memberUser.name',
                'memberUser.phone',
                'chat',                      // chats 전체
                'sender.id',
                'sender.name',
            ])

            // ORDER BY (chats)
            .orderBy('chat.timestamp', 'ASC')

            .getOne();

    }

    async getCarpoolRoomDetail( id: number ): Promise<CarpoolRoom | null> {
        return await this.carpoolRoomRepository
            .createQueryBuilder('carpool')
            .leftJoin('carpool.driver', 'driver')
            .leftJoin('carpool.members', 'member')
            .leftJoin('member.user', 'memberUser')
            .where('carpool.id = :id', { id })
            .select([
                'carpool',
                'driver.id',
                'driver.name',
                'driver.phone',
                'member',
                'memberUser.id',
                'memberUser.name',
                'memberUser.phone',
            ])
            .getOne()
    }

    async findMyCarpoolRooms( userId: number ): Promise<CarpoolRoom[]> {
        return await this.carpoolRoomRepository
            .createQueryBuilder('carpool')
            .innerJoin('carpool.members', 'memberFilter')
            .leftJoin('carpool.driver', 'driver')
            .leftJoin('carpool.members', 'member')
            .leftJoin('member.user', 'memberUser')
            .where('member.userId = :userId', { userId })
            .orderBy('carpool.departureTime', 'DESC')
            .select([
                'carpool',
                'driver.id',
                'driver.name',
                'driver.phone',
                'member',
                'memberUser.id',
                'memberUser.name',
                'memberUser.phone',
            ])
            .getMany()
    }

    async createCarpoolRoom(dto: createCarpoolRequestDto ): Promise<CarpoolRoom> {
 
        
        return await this.dataSource.transaction(async (manager) => {
            // 1. 방 생성
            const carpool = manager.create(CarpoolRoom, {
            driverId: dto.driverId,
            carInfo: dto.carInfo,
            departureTime: new Date(dto.departureTime),
            origin: dto.origin,
            originDetailed: dto.originDetailed ?? null,
            destination: dto.destination,
            destinationDetailed: dto.destinationDetailed ?? null,
            seatsTotal: dto.seatsTotal,
            seatsLeft: dto.seatsTotal - 1, // driver가 바로 참여
            note: dto.note,
            originLat: dto.originLat,
            originLng: dto.originLng,
            destLat: dto.destLat,
            destLng: dto.destLng,
            } as DeepPartial<CarpoolRoom>);

            const savedRoom = await manager.save(carpool);

            // 2. driver를 member로 자동 추가
            await manager.insert(CarpoolMember, {
            userId: dto.driverId,
            roomId: savedRoom.id,
            });

            return savedRoom;
        });
    }

    async updateCarpoolRoom(dto: updateCarpoolRequestDto ): Promise<CarpoolRoom> {
        const existing = await this.carpoolRoomRepository.findOne({
            where: { id: dto.carpoolId },
        });
        if (!existing) {
            throw new NotFoundException('Carpool not found');
        }

        const updatableFields: (keyof updateCarpoolRequestDto)[] = [
            'carInfo',
            'departureTime',
            'origin',
            'originDetailed',
            'destination',
            'destinationDetailed',
            'seatsTotal',
            'seatsLeft',
            'note',
            'originLat',
            'originLng',
            'destLat',
            'destLng',
            'isArrived',
        ];

        for (const key of updatableFields) {
            const value = dto[key];
            if (value != null) { // null & undefined 제외 → 기존 값 유지
                (existing as any)[key] = value;
            }
        }

        return this.carpoolRoomRepository.save(existing);

    }

    async deleteCarpoolRoom(roomId: number): Promise<Boolean> {
        return this.dataSource.transaction(async (manager) => {
            // 1. 방에 속한 모든 멤버 삭제
            await manager.delete(CarpoolMember, { roomId });

            // 2. 방 삭제 (PK 기준)
            const result = await manager.delete(CarpoolRoom, roomId);

            return (result.affected ?? 0) > 0;
        });
    }

    async joinCarpoolRoom(dto: participationCarpoolRequestDto): Promise<Boolean> {
        try {
            // transaction으로 처리
            await this.dataSource.transaction(async (manager) => {
                //member에 있는지 확인
                const isMember = await manager.exists(CarpoolMember, {
                    where: { 
                        userId: dto.userId, 
                        roomId: dto.roomId }
                    ,
                });
                if (isMember) {
                    throw new Error('Already joined');
                }

                // 잔여석 조건부 감소. 잔여석이 음수가 되지 않도록.
                const result = await manager
                    .createQueryBuilder()
                    .update(CarpoolRoom)
                    .set({
                        seatsLeft: () => 'seatsLeft - 1',
                    }) 
                    .where('id = :roomId', { roomId: dto.roomId })
                    .andWhere('seatsLeft > 0')
                    .execute();


                if (result.affected === 0) {
                    throw new Error('NO_SEAT');
                }

                // 3. 멤버 추가
                await manager.insert(CarpoolMember, {
                    userId: dto.userId,
                    roomId: dto.roomId,
                });           

            });

            // redis에 member 추가 처리
            // redis 관련 정리되면 작업

            // socket room join 처리
            // 추후 채팅방의 동작이 구현될 때 처리

            // fcm을 통한 join notice
            // fcm service 구현 이후 처리

            return true;
        } catch (err) {
            return false;
        }

    }

    async leaveCarpoolRoom(dto: participationCarpoolRequestDto): Promise<Boolean> {
        try {
            await this.dataSource.transaction(async (manager) => {
                await manager.delete(CarpoolMember, {
                    userId: dto.userId,
                    roomId: dto.roomId,
                });

                const result = await manager
                    .createQueryBuilder()
                    .update(CarpoolRoom)
                    .set({
                        seatsLeft: () => 'seatsLeft + 1',
                        isArrived: false,
                    })
                    .where('id = :roomId', { roomId: dto.roomId })
                    .execute();                

                if ((result.affected ?? 0) === 0) {
                    throw new Error('Carpool room not found');
                }
            });

            // TODO: redis에 member 제거 처리
            // redis 관련 정리되면 작업

            // TODO: socket room leave 처리
            // 추후 채팅방의 동작이 구현될 때 처리

            // TODO: fcm을 통한 leave notice
            // fcm service 구현 이후 처리

            return true;
        } catch (err) {
            return false;
        }
    }
    

    async updateCarpoolStatus(dto: updateCarpoolstatusRequestDto): Promise<CarpoolRoom> {
        await this.carpoolRoomRepository.update(
            { id: dto.roomId },
            { status: dto.newStatus },
        );

        const carpool = await this.carpoolRoomRepository.findOne({
            where: { id: dto.roomId },
        });

        if(!carpool) {
            throw new NotFoundException('Carpool not found');
        }

        return carpool;
    }

    async oldCarpoolArriveUpdate(currentTime: Date): Promise<void> {
        const baseTime = new Date(currentTime);
        baseTime.setDate(baseTime.getDate() - 1);

        const result = await this.carpoolRoomRepository
            .createQueryBuilder()
            .update(CarpoolRoom)
            .set({
                isArrived: true,
                status: CarpoolStatus.Arrived,
            })
            .where('departure_time <= :baseTime', { baseTime })
            .andWhere('is_arrived = false')
            .execute();       
    }
}

