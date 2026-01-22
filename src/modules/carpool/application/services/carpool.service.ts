import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, DataSource, Between } from 'typeorm';
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
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { ExpoNotificationService } from '@modules/push-notification/application/services/expo-notification/ExpoNotification.service';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { CarpoolDeleteNotificationDto, CarpoolJoinNotificationDto, CarpoolLeaveNotificationDto, CarpoolReadyNotificationDto, CarpoolStartNotificationDto, CarpoolUpdateNotificationDto } from '@modules/push-notification/application/dto/carpool-notification.dto';
import { CarpoolDetailResponseDto, CarpoolWithDriverInfoResponseDto } from '@modules/carpool/presentation/dto/carpool.response.dto';
import { maskPhone } from '@shared/utils/maskPhone.util';
// fcmservice
// redis


@Injectable() 
export class CarpoolService {
    private readonly logger = new Logger(CarpoolService.name);
    constructor(
        @InjectRepository(CarpoolRoom)
        private carpoolRoomRepository: Repository<CarpoolRoom>,
        @InjectRepository(CarpoolMember)
        private carpoolMemberRepository: Repository<CarpoolMember>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly expoMessageService: ExpoNotificationService,
        private readonly expoTokenService: ExpoPushTokenService,
        private readonly dataSource: DataSource,
    ) {}

    async getAllCarpoolRooms(): Promise<CarpoolRoom[]> {
        const carpools = await this.carpoolRoomRepository
            .createQueryBuilder('carpool')
            .leftJoin('carpool.driver', 'driver')
            .select([
                'carpool',
                'driver.id',
                'driver.name',
            ])
            .orderBy('carpool.createdAt', 'DESC')
            .getMany();
        
        if (!carpools.length) {
            throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
        }
        return carpools;
    }

    async getCarpoolRoomById( id: number ): Promise<CarpoolRoom> {
        const carpool = await this.carpoolRoomRepository
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

        if (!carpool) {
            throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
        }

        return carpool;

    }

    async getCarpoolRoomDetail( id: number ): Promise<CarpoolDetailResponseDto> {
        const carpool = await this.carpoolRoomRepository
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

        if (!carpool) {
            throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
        }

        return {
            id: carpool.id,
            driverId: carpool.driverId,
            carInfo: carpool.carInfo,
            departureTime: carpool.departureTime.toString(),
            origin: carpool.origin,
            originDetailed: carpool.originDetailed,
            destination: carpool.destination,
            destinationDetailed: carpool.destinationDetailed,
            seatsTotal: carpool.seatsTotal,
            seatsLeft: carpool.seatsLeft,
            note: carpool.note,
            originLat: carpool.originLat ?? null,
            originLng: carpool.originLng ?? null,
            destLat: carpool.destLat ?? null,
            destLng: carpool.destLng ?? null,
            isArrived: carpool.isArrived,
            createdAt: carpool.createdAt.toString(),
            updatedAt: carpool.updatedAt.toString(),
            status: carpool.status,
            driver: {
                id: carpool.driver.id,
                name: carpool.driver.name,
                phone: carpool.driver.phone,
            },
            members: carpool.members.map(m => ({
                id: m.user.id,
                name: m.user.name,
                phone: maskPhone(m.user.phone),
            })),
        };
    }

    async findMyCarpoolRooms( userId: number ): Promise<CarpoolRoom[]> {
        const carpools = await this.carpoolRoomRepository
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
        if (!carpools.length) {
            throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
        }
        return carpools;
    }

    async findAvailableCarpools(userId?: number): Promise<CarpoolWithDriverInfoResponseDto[]> {
        const qb = this.carpoolRoomRepository
            .createQueryBuilder('carpool')
            .leftJoin('carpool.driver', 'driver')

            // 활성 카풀 조건: arrived가 아님
            .where('carpool.status != :arrived', {
                arrived: CarpoolStatus.Arrived,
            })

            .select([
                'carpool',
                'driver.id',
                'driver.name',
                'driver.phone',
            ])

            .orderBy('carpool.departureTime', 'ASC');

        //  유저가 이미 참여 중인 카풀 제외
        if (userId != null) {
            qb.leftJoin(
                'carpool.members',
                'myMember',
                'myMember.userId = :userId',
                { userId },
            )
            .andWhere('myMember.userId IS NULL');
        }

        const { entities } = await qb.getRawAndEntities();
        return entities.map(
            (row) => ({
                    id: row.id,
                    driverId: row.driverId,
                    carInfo: row.carInfo,
                    departureTime: row.departureTime?.toString() ?? null,
                    origin: row.origin,
                    originDetailed: row.originDetailed,
                    destination: row.destination,
                    destinationDetailed: row.destinationDetailed,
                    seatsTotal: row.seatsTotal,
                    seatsLeft: row.seatsLeft,
                    note: row.note,
                    originLat: row.originLat ?? null,
                    originLng: row.originLng ?? null,
                    destLat: row.destLat ?? null,
                    destLng: row.destLng ?? null,
                    isArrived: row.isArrived,
                    createdAt: row.createdAt?.toString() ?? null,
                    updatedAt: row.updatedAt?.toString() ?? null,
                    status: row.status,
                    driver: {
                        id: row.driver.id,
                        name: row.driver.name,
                        phone: row.driver.phone,
                    }                  
                })
        );
    }

    async findParticipatingCarpools(userId: number): Promise<CarpoolWithDriverInfoResponseDto[]> {
        const qb = this.carpoolRoomRepository
            .createQueryBuilder('carpool')

            // 참여 중인 카풀 필터 (필터용 조인)
            .innerJoin(
                'carpool.members',
                'myMember',
                'myMember.userId = :userId',
                { userId },
            )

            // driver만 결과로 필요
            .leftJoin('carpool.driver', 'driver')

            // 활성 카풀 조건
            .where('carpool.status != :arrived', {
                arrived: CarpoolStatus.Arrived,
            })

            .select([
                'carpool',
                'driver.id',
                'driver.name',
                'driver.phone',
            ])

            .orderBy('carpool.departureTime', 'DESC')
            // .getMany(); // 빈 배열 허용
            
        const { entities } = await qb.getRawAndEntities();
        return entities.map(
            (row) => ({
                    id: row.id,
                    driverId: row.driverId,
                    carInfo: row.carInfo,
                    departureTime: row.departureTime?.toString() ?? null,
                    origin: row.origin,
                    originDetailed: row.originDetailed,
                    destination: row.destination,
                    destinationDetailed: row.destinationDetailed,
                    seatsTotal: row.seatsTotal,
                    seatsLeft: row.seatsLeft,
                    note: row.note,
                    originLat: row.originLat ?? null,
                    originLng: row.originLng ?? null,
                    destLat: row.destLat ?? null,
                    destLng: row.destLng ?? null,
                    isArrived: row.isArrived,
                    createdAt: row.createdAt?.toString() ?? null,
                    updatedAt: row.updatedAt?.toString() ?? null,
                    status: row.status,
                    driver: {
                        id: row.driver.id,
                        name: row.driver.name,
                        phone: row.driver.phone,
                    }                  
                })
        );
        
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
            if (value == null) continue;

            if (key === 'departureTime') {
                existing.departureTime = new Date(value as any);
            } else {
                (existing as any)[key] = value;
            }
        }

        const result = await this.carpoolRoomRepository.save(existing);

        // 카풀 수정 알림 전송
        const members = await this.getCarpoolMembers(result.id);
        const notificationTarget = members.filter(v => v != result.driverId);

        const tokens = await this.expoTokenService.getTokens(notificationTarget);

        const notification = new CarpoolUpdateNotificationDto();

        await this.expoMessageService.send(tokens, notification);


        return result;

    }

    async deleteCarpoolRoom(roomId: number): Promise<void> {
        const room = await this.carpoolRoomRepository.findOne({
            where: { id: roomId },
        });
        if (!room) {
            throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
        }

        // 카풀 멤버 조회
        const members = await this.getCarpoolMembers(room.id);

        // 알림 대상. 운전자 제외
        const notificationTarget = members.filter(v => v != room.driverId);

        // 토큰 조회
        const tokens = await this.expoTokenService.getTokens(notificationTarget);

        // 알림 생성
        const notification = new CarpoolDeleteNotificationDto();

        await this.dataSource.transaction(async (manager) => {
            // 카풀 존재 여부 확인
            const roomExists = await manager.exists(CarpoolRoom, {
                where: { id: roomId },
            });            
            if (!roomExists) {
                throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
            }
            // 1. 방에 속한 모든 멤버 삭제
            await manager.delete(CarpoolMember, { roomId });

            // 2. 방 삭제 (PK 기준)
            await manager.delete(CarpoolRoom, { id: roomId});
        });

        // 카풀 삭제 알림 전송
        await this.expoMessageService.send(tokens, notification);

    }

    async joinCarpoolRoom(dto: participationCarpoolRequestDto): Promise<CarpoolRoom> {
        try {
            // transaction으로 처리
            const joinedRoom = await this.dataSource.transaction(async (manager) => {
                // 카풀 존재 여부 확인
                const room = await manager.findOne(CarpoolRoom, {
                    where: { id: dto.roomId },
                    select: ['id', 'seatsLeft'],
                });

                if (!room) {
                    throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
                }

                //member에 있는지 확인
                const isMember = await manager.exists(CarpoolMember, {
                    where: { 
                        userId: dto.userId, 
                        roomId: dto.roomId 
                    },
                });
                if (isMember) {
                    throw new Error(ERROR_MESSAGES.CARPOOL_ALREADY_JOINED);
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
                    throw new Error(ERROR_MESSAGES.CARPOOL_NO_SEAT);
                }

                // 멤버 추가
                await manager.insert(CarpoolMember, {
                    userId: dto.userId,
                    roomId: dto.roomId,
                });           
                // 최신 상태 조회
                const updatedRoom = await manager.findOneOrFail(CarpoolRoom, {
                    where: { id: dto.roomId },
                });

                return updatedRoom;
            });


            // 토큰 조회
            const tokens = await this.expoTokenService.getTokens(joinedRoom.driverId);

            // 참여자 이름 조회
            const user = await this.userRepository.findOne({
                where: { id: dto.userId },
                select: ['name'],
            });
            if (!user) {
                throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
            }
            const userName = user.name;
            
            // 알림 생성
            const notification = new CarpoolJoinNotificationDto(userName);

            // 카풀 join 알림 전송
            await this.expoMessageService.send(tokens, notification);

            return joinedRoom;

        } catch (err) {
            throw err;
        }

    }

    async leaveCarpoolRoom(dto: participationCarpoolRequestDto): Promise<CarpoolRoom> {
        try {
            const leavedRoom = await this.dataSource.transaction(async (manager) => {
                // 카풀 존재 여부 확인
                const room = await manager.findOne(CarpoolRoom, {
                    where: { id: dto.roomId },
                    select: ['id'],
                });

                if (!room) {
                    throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
                }

                // 멤버 여부 확인
                const isMember = await manager.exists(CarpoolMember, {
                    where: {
                        userId: dto.userId,
                        roomId: dto.roomId,
                    },
                });

                if (!isMember) {
                    throw new Error(ERROR_MESSAGES.CARPOOL_NOT_MEMBER);
                }

                // 멤버 삭제
                await manager.delete(CarpoolMember, {
                    userId: dto.userId,
                    roomId: dto.roomId,
                });

                // 좌석 증가
                await manager
                    .createQueryBuilder()
                    .update(CarpoolRoom)
                    .set({
                        seatsLeft: () => 'seatsLeft + 1',
                        isArrived: false,
                    })
                    .where('id = :roomId', { roomId: dto.roomId })
                    .execute();
                // 최신 상태 조회
                const updatedRoom = await manager.findOneOrFail(CarpoolRoom, {
                    where: { id: dto.roomId },
                });

                return updatedRoom;                    
            });


            // 토큰 조회
            const tokens = await this.expoTokenService.getTokens(leavedRoom.driverId);

            // 이름 조회
            const user = await this.userRepository.findOne({
                where: { id: dto.userId },
                select: ['name'],
            });
            if (!user) {
                throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
            }
            const userName = user.name;
            
            // 알림 생성
            const notification = new CarpoolLeaveNotificationDto(userName);

            // 카풀 leave 알림 전송
            await this.expoMessageService.send(tokens, notification);


            return leavedRoom;

        } catch (err) {
            throw err;
        }
    }
    

    async updateCarpoolStatus(dto: updateCarpoolstatusRequestDto): Promise<CarpoolRoom> {
        return this.dataSource.transaction(async (manager) => {
            const room = await manager.findOne(CarpoolRoom, {
                where: { id: dto.roomId },
            });

            if (!room) {
                throw new NotFoundException(ERROR_MESSAGES.CARPOOL_NOT_FOUND);
            }

            room.status = dto.newStatus;

            await manager.save(room);

            return room;
        });
    }

    async checkCarpoolReady(currentTime: Date): Promise<void> {
        this.logger.log('start check carpool ready');

        const baseTime = new Date(currentTime);
        baseTime.setHours(baseTime.getHours() + 1, baseTime.getMinutes(), 0, 0);

        const targetTime = new Date(baseTime);
        targetTime.setMinutes(baseTime.getMinutes() + 5);


        const baseTimeStr = baseTime.toISOString().slice(0, 19).replace('T', ' ');
        const targetTimeStr = targetTime.toISOString().slice(0, 19).replace('T', ' ');

        // Repository를 통해 출발 1시간~1시간 5분 전 카풀 조회
        const readyCarpoolList = await this.carpoolRoomRepository
            .createQueryBuilder('carpool')
            .where('carpool.departureTime >= :baseTime', { baseTime: baseTimeStr })
            .andWhere('carpool.departureTime < :targetTime', { targetTime: targetTimeStr })
            .andWhere('carpool.isArrived = false')
            .getMany(); 

        this.logger.log(readyCarpoolList);
        for (const carpool of readyCarpoolList) {
            try {
                const driverId = carpool.driverId;
                const tokens = await this.expoTokenService.getTokens(driverId);
                const notification = new CarpoolReadyNotificationDto();

                await this.expoMessageService.send(tokens, notification);
                this.logger.log(`Notification sent to driverId: ${driverId}`);
            } catch (err) {
                this.logger.error(`Failed to send notification for carpoolId: ${carpool.id}`, err);
            }
        }

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
            .where('departureTime <= :baseTime', { baseTime })
            .andWhere('isArrived = false')
            .execute();       
    }

    // 카풀 운전자가 출발 했음.
    async startCarpool(id: number): Promise<void> {
        // carpool이 start 가능한 상황인지 검증 절차


        // 카풀 상태 변경
        const carpool = await this.updateCarpoolStatus({roomId: id, newStatus: CarpoolStatus.In_Transit});

        // 카풀 출발 알림 전송
        const members = await this.getCarpoolMembers(id);
        const notificationTarget = members.filter(v => v != carpool.driverId);

        const tokens = await this.expoTokenService.getTokens(notificationTarget);

        const driverName = await this.getDriverName(id);
        const notification = new CarpoolStartNotificationDto(driverName);

        await this.expoMessageService.send(tokens, notification);
    }

    async getCarpoolMembers(roomId: number): Promise<number[]> {
        const members = await this.carpoolMemberRepository.find({
            where: { roomId },
            select: ['userId'],
        });

        return members.map(member => member.userId);        
    }

    async getDriverName(roomId: number): Promise<string> {
        const result = await this.carpoolRoomRepository
            .createQueryBuilder('room')
            .innerJoin('room.driver', 'driver')
            .select('driver.name', 'name')
            .where('room.id = :roomId', { roomId })
            .getRawOne<{ name: string }>();

        if (!result) {
            throw new Error('Driver not found for this carpool room');
        }

        return result.name;       
    }
}

