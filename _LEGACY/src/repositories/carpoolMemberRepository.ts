import { CarpoolMember, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class CarpoolMemberRepository {
	async findGroupsByUserId(userId: number):Promise<number[]> {
		const result = await prisma.carpoolMember.findMany({
		where: {
			userId: userId
		},
		select: {
			roomId: true,
		}
		});

		return result.map(e => e.roomId);
	}
	async findUserByCarpoolId(carpoolId: number):Promise<number[]> {
		const result = await prisma.carpoolMember.findMany({
		where: {
			roomId: carpoolId
		},
		select: {
			userId: true,
		}
		});

		return result.map(e => e.userId);
	}

  /** 특정 방에 새 멤버 추가 */
  async addMember(userId: number, roomId: number): Promise<CarpoolMember> {
    return prisma.carpoolMember.create({
      data: { userId, roomId },
    })
  }

  /** 특정 방에서 멤버 제거 */
  async removeMember(userId: number, roomId: number): Promise<void> {
    await prisma.carpoolMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        }
      }
    })
  }

  /** 특정 방의 멤버 수 조회 */
  async countMembers(roomId: number): Promise<number> {
    return prisma.carpoolMember.count({
      where: { roomId },
    })
  }

  /** 사용자가 특정 방의 멤버인지 여부 확인 */
  async isMember(userId: number, roomId: number): Promise<boolean> {
    const count = await prisma.carpoolMember.count({
      where: { userId, roomId },
    })
    return count > 0
  }

  /** 방에 속한 멤버 레코드 전체 조회 (joinedAt 포함) */
  async findMembersDetailed(roomId: number): Promise<CarpoolMember[]> {
    return prisma.carpoolMember.findMany({
      where: { roomId },
      orderBy: { joinedAt: 'asc' },
    })
  }

	/** 드라이버가 카풀 방을 닫을 경우, 특정 방의 모든 멤버 제거 */
	async removeAllByRoomId(roomId: number): Promise<void> {
		await prisma.carpoolMember.deleteMany({
			where: { roomId },
		});
	}

}

export default CarpoolMemberRepository;