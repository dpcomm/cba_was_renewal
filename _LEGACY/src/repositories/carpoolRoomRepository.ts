import { PrismaClient, CarpoolRoom } from '@prisma/client';
import { CarpoolRoomDetailDto, CreateCarpoolDto, UpdateCarpoolDto } from '@dtos/carpoolDto';

const prisma = new PrismaClient();

export default class CarpoolRoomRepository {
  async findAll(
    origin?: string,
    destination?: string,
  ): Promise<CarpoolRoom[]> {
    return prisma.carpoolRoom.findMany({
      where: {
        origin: origin ? { contains: origin } : undefined,
        destination: destination ? { equals: destination } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { select: { id: true, name: true } },
      },
    });
  }

  async findById(id: number): Promise<CarpoolRoom | null> {
    return prisma.carpoolRoom.findUnique({
      where: { id },
      include: {
        driver: {
          select: { id: true, name: true, phone: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, phone: true }
            },
          },
        },
        chats: {
          include: {
            sender: { select: { id: true, name: true } },
          },
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  }

  async findDetailById(id: number): Promise<CarpoolRoomDetailDto | null> {
    const room = await prisma.carpoolRoom.findUnique({
      where: { id },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, phone: true } }
          }
        }
      }
    });

    if (!room) return null;

    return {
      id: room.id,
      driverId: room.driverId,
      carInfo: room.carInfo,
      departureTime: room.departureTime,
      origin: room.origin,
      originDetailed: room.originDetailed,
      destination: room.destination,
      destinationDetailed: room.destinationDetailed,
      seatsTotal: room.seatsTotal,
      seatsLeft: room.seatsLeft,
      note: room.note,
      originLat: room.originLat?.toNumber() ?? null,
      originLng: room.originLng?.toNumber() ?? null,
      destLat: room.destLat?.toNumber() ?? null,
      destLng: room.destLng?.toNumber() ?? null,
      isArrived: room.isArrived,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      status: room.status,
      driver: {
        id: room.driver.id,
        name: room.driver.name,
        phone: room.driver.phone,
      },
      members: room.members.map(m => ({
        userId: m.user.id,
        name: m.user.name,
        phone: m.user.phone,
      })),
    };
  }

  async findMyCarpools(userId: number): Promise<CarpoolRoom[]> {
  return prisma.carpoolRoom.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      }
    },
    orderBy: { departureTime: 'desc' },
    include: {
      driver: {
        select: { id: true, name: true, phone: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, phone: true }
          }
        }
      }
    }
  });
}

  async create(dto: CreateCarpoolDto): Promise<CarpoolRoom> {
    return prisma.carpoolRoom.create({
      data: {
        driverId: dto.driverId,
        carInfo: dto.carInfo,
        departureTime: dto.departureTime,
        origin: dto.origin,
        originDetailed: dto.originDetailed ?? null,
        destination: dto.destination,
        destinationDetailed: dto.destinationDetailed ?? null,
        seatsTotal: dto.seatsTotal,
        seatsLeft: dto.seatsTotal,
        note: dto.note,
        originLat: dto.originLat,
        originLng: dto.originLng,
        destLat: dto.destLat,
        destLng: dto.destLng,
      },
    });
  }

  async edit(id: number, dto: UpdateCarpoolDto): Promise<CarpoolRoom> {
    const existing = await prisma.carpoolRoom.findUniqueOrThrow({ where: { id } });

    return prisma.carpoolRoom.update({
      where: { id },
      data: {
        carInfo: dto.carInfo ?? existing.carInfo,
        departureTime: dto.departureTime ?? existing.departureTime,
        origin: dto.origin ?? existing.origin,
        originDetailed: dto.originDetailed ?? existing.originDetailed,
        destination: dto.destination ?? existing.destination,
        destinationDetailed: dto.destinationDetailed ?? existing.destinationDetailed,
        seatsTotal: dto.seatsTotal ?? existing.seatsTotal,
        seatsLeft: dto.seatsLeft ?? existing.seatsLeft,
        note: dto.note ?? existing.note,
        originLat: dto.originLat ?? existing.originLat,
        originLng: dto.originLng ?? existing.originLng,
        destLat: dto.destLat ?? existing.destLat,
        destLng: dto.destLng ?? existing.destLng,
        isArrived: dto.isArrived ?? existing.isArrived,
      },
    });
  }


  async update(id: number, dto: UpdateCarpoolDto): Promise<CarpoolRoom> {
    return prisma.carpoolRoom.update({
      where: { id },
      data: {
        carInfo: dto.carInfo,
        departureTime: dto.departureTime,
        origin: dto.origin,
        originDetailed: dto.originDetailed ?? null,
        destination: dto.destination,
        destinationDetailed: dto.destinationDetailed ?? null,
        seatsTotal: dto.seatsTotal,
        seatsLeft: dto.seatsLeft,
        note: dto.note,
        originLat: dto.originLat,
        originLng: dto.originLng,
        destLat: dto.destLat,
        destLng: dto.destLng,
        isArrived: dto.isArrived,
      },
    });
  }

  async decrementSeatsLeft(roomId: number, amount = 1): Promise<CarpoolRoom> {
    return prisma.carpoolRoom.update({
      where: { id: roomId },
      data: {
        seatsLeft: { decrement: amount },
        isArrived: false,
      },
    });
  }

  async incrementSeatsLeft(roomId: number, amount = 1): Promise<CarpoolRoom> {
    return prisma.carpoolRoom.update({
      where: { id: roomId },
      data: {
        seatsLeft: { increment: amount },
        isArrived: false,
      },
    });
  }

  async delete(id: number): Promise<CarpoolRoom> {
    return prisma.carpoolRoom.delete({ where: { id } });
  }

  async getDriver(id: number) {
    const result = await prisma.carpoolRoom.findUnique({
      where: {
        id,
      },
      select: {
        driverId: true,
      }
    });

    return result?.driverId ?? null;
  }

  async findReadyCarpool(currentTime: Date): Promise<number[]> {
    const baseTime = new Date(currentTime);
    baseTime.setHours(baseTime.getHours() + 1, baseTime.getMinutes(), 0, 0);

    const targetTime = new Date(baseTime);
    targetTime.setMinutes(baseTime.getMinutes() + 5);

    const result = await prisma.carpoolRoom.findMany({
      where: {
        departureTime: {
          gte: baseTime,
          lt: targetTime,
        },
        isArrived: false,
      },
      select: {
        id: true,
      }
    });

    return (await result).map(e => e.id);
  }

  async oldCarpoolArriveUpdate(currentTime: Date) {
    const baseTime = new Date(currentTime);
    baseTime.setDate(baseTime.getDate() -1);

    return await prisma.carpoolRoom.updateMany({
      where: {
        departureTime: {
          lte: baseTime,
        },
        isArrived: false,
      },
      data: {
        isArrived: true,
        status: 'arrived'
      },
    });
  }

  async updateStatus(roomId: number, newStatus: string) {
    try {
      const updatedRoom = await prisma.carpoolRoom.update({
        where: { id: roomId },
        data: { status: newStatus },
      });
      return updatedRoom;
    } catch (error) {
      console.error(`Failed to update carpool status in DB for room ${roomId}:`, error);
      return null;
    }
  }
}