import { CreateCarpoolDto, UpdateCarpoolDto } from "@dtos/carpoolDto";
import { getIO } from "@socket/socket";
import redisClient from "@utils/redis";
import CarpoolMemberRepository from "@repositories/carpoolMemberRepository";
import CarpoolRoomRepository from "@repositories/carpoolRoomRepository";
import FcmService from "./fcmService";
import { listenerCount } from "process";

const fcmService = new FcmService();

class CarpoolService {
  private carpoolRoomRepository = new CarpoolRoomRepository();
  private carpoolMemberRepository = new CarpoolMemberRepository();

  async getAllCarpoolRooms() {
    try {
      const rooms = await this.carpoolRoomRepository.findAll();
      if (!rooms || rooms.length === 0) {
        return {
          ok: 0,
          message: 'No carpool rooms found',
          rooms
        };
      }
      return {
        ok: 1,
        message: 'getAllCarpools success',
        rooms
      };
    } catch (err) {
      throw err;
    }
  }

  async getCarpoolRoomById(id: number) {
    try {
      const room = await this.carpoolRoomRepository.findById(id);
      if (!room) {
        return {
          ok: 0,
          message: `Carpool ${id} not found`
        };
      }
      return {
        ok: 1,
        message: 'getCarpoolById success',
        room
      };
    } catch (err) {
      throw err;
    }
  }

  async getCarpoolRoomDetail(id: number) {
    try {
      const detail = await this.carpoolRoomRepository.findDetailById(id);
      if (!detail) {
        return {
          ok: 0,
          message: `Carpool ${id} not found`
        };
      }
      return {
        ok: 1,
        message: 'getCarpoolRoomDetail success',
        room: detail
      };
    } catch (err) {
      throw err;
    }
  }

  async findMyCarpoolRooms(userId: number) {
    try {
      const rooms = await this.carpoolRoomRepository.findMyCarpools(userId);
      
      if (!rooms || rooms.length === 0) {
        return {
          ok: 0,
          message: 'No carpool rooms found',
          rooms: []
        };
      }
      return {
        ok: 1,
        message: 'findMyCarpoolRooms success',
        rooms
      };     
    } catch (error) {
      console.error('findMyCarpoolRooms error:', error);
      return { 
        ok: 0, 
        message: '마이 카풀 목록을 조회하는 중 오류 발생'
      };
    }
  }

  /* 아마 이때 채팅방 열어어 할 듯. */
  async createCarpoolRoom(dto: CreateCarpoolDto) {
    const room = await this.carpoolRoomRepository.create(dto)
    if (!room) {
      return {
        ok: 0,
        message: 'Failed to create carpool',
      }
    }
    /** 생성과 동시에 드라이버를 멤버로 추가. */
    await this.carpoolMemberRepository.addMember(dto.driverId, room.id)
    return {
      ok: 1,
      message: 'createCarpool success',
      room,
    }
  }

  async editCarpoolRoom(id: number, dto: UpdateCarpoolDto) {
    try {
      const room = await this.carpoolRoomRepository.update(id, dto);
      if (!room) {
        return {
          ok: 0,
          message: `Failed to edit carpool ${id}`
        };
      }
      return {
        ok: 1,
        message: 'edit Carpool success',
        room
      };
    } catch (err) {
      throw err;
    }
  }

  async updateCarpoolRoom(id: number, dto: UpdateCarpoolDto) {
    try {
      const room = await this.carpoolRoomRepository.update(id, dto);
      if (!room) {
        return {
          ok: 0,
          message: `Failed to update carpool ${id}`
        };
      }
      return {
        ok: 1,
        message: 'updateCarpool success',
        room
      };
    } catch (err) {
      throw err;
    }
  }

  /** 카풀 방 삭제 (멤버 먼저 제거 후 방 삭제) */
  async deleteCarpoolRoom(id: number) {
    try {
      // 방에 속한 모든 멤버 제거
      await this.carpoolMemberRepository.removeAllByRoomId(id);

      // 방 삭제
      const result = await this.carpoolRoomRepository.delete(id);
      if (!result) {
        return {
          ok: 0,
          message: `Failed to delete carpool ${id}`
        };
      }
      return {
        ok: 1,
        message: 'deleteCarpool success'
      };
    } catch (err) {
      throw err;
    }
  }

  async joinCarpoolRoom(userId: number, roomId: number) {
    const isMember = await this.carpoolMemberRepository.isMember(userId, roomId);
    if (isMember) {
      return {
        ok: 0,
        message: 'User already joined this carpool'
      };
    }
    await this.carpoolMemberRepository.addMember(userId, roomId);
    await this.carpoolRoomRepository.decrementSeatsLeft(roomId);

    //redis에 member 추가
    const existing = await redisClient.hGet("carpoolMember", roomId.toString());
    let members: number[] = [];

    if (existing) { members = JSON.parse(existing); }
    members.push(userId);
    await redisClient.hSet("carpoolMember", roomId.toString(), JSON.stringify(members));   


    //socket room join
    const IO = getIO();
    const socketId = await redisClient.hGet("userToSocket", userId.toString());
    if (socketId) { 
      const socket = IO.sockets.sockets.get(socketId); 
      socket?.join(`chatroom:${roomId}`);
      console.log(`${userId} join to chatroom:${roomId}`);
    }

    //notice
    await fcmService.sendCarpoolEnterNotificationMessage(userId, roomId);

    return {
      ok: 1,
      message: 'joinCarpool success'
    };
  }

  async leaveCarpoolRoom(userId: number, roomId: number) {
    try {
      await this.carpoolMemberRepository.removeMember(userId, roomId);
      await this.carpoolRoomRepository.incrementSeatsLeft(roomId);

      //redis에 member 제거
      const existing = await redisClient.hGet("carpoolMember", roomId.toString());
      let members: number[] = [];

      if (existing) { members = JSON.parse(existing); }
      const result = members.filter(m => m !== userId);
      await redisClient.hSet("carpoolMember", userId.toString(), JSON.stringify(result));


      //socket room leave
      const IO = getIO();
      const socketId = await redisClient.hGet("userToSocket", userId.toString());
      if (socketId) { 
        const socket = IO.sockets.sockets.get(socketId); 
        socket?.leave(`chatroom:${roomId}`);
        console.log(`${userId} leave to chatroom:${roomId}`);
      }

      //notice
      await fcmService.sendCarpoolLeaveNotificationMessage(userId, roomId);

      return {
        ok: 1,
        message: 'leaveCarpool success'
      };
    } catch (err) {
      throw err;
    }
  }

  async checkCarpoolReady(currentTime: Date) {
    try {
      const readyCarpoolList = await this.carpoolRoomRepository.findReadyCarpool(currentTime);
      if (readyCarpoolList.length != 0) {
        for(const carpool of readyCarpoolList) {
          await fcmService.sendCarpoolReadyNotificationMessage(carpool);
        }
      }
    } catch (err: any) {
      throw err;
    }
  }

  async oldCarpoolArriveUpdate(currentTime: Date) {
    try {
      await this.carpoolRoomRepository.oldCarpoolArriveUpdate(currentTime);
    } catch (err: any) {
      throw err;
    }
  }

  async updateCarpoolStatus(roomId: number, newStatus: string) {
    try {
      const updatedRoom = await this.carpoolRoomRepository.updateStatus(roomId, newStatus);

      if (!updatedRoom) {
        return {
          ok: 0,
          message: `Failed to update status for carpool ${roomId} to ${newStatus}`
        };
      }

      return {
        ok: 1,
        message: `Carpool ${roomId} status updated to ${newStatus} success`,
        room: updatedRoom
      };
    } catch (err: any) {
      console.error(`Error updating carpool ${roomId} status to ${newStatus}:`, err);

      return {
        ok: 0,
        message: `Failed to update carpool status due to an internal error: ${err.message || err.toString()}`
      };
    }
  }
}

export default CarpoolService;