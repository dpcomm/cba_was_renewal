import { PrismaClient } from '@prisma/client';
import { requestCreatePrayDto } from '@dtos/prayDto';

const prisma = new PrismaClient();

class PrayRepository {
  async findAllPrays() {
    return await prisma.pray.findMany();
  }

  async createPray(prayDto: requestCreatePrayDto) {
    return await prisma.pray.create({
      data: {
        userId: prayDto.userId,
        content: prayDto.content,
      },
    });
  }

  async deletePray(id: number) {
    return await prisma.pray.delete({
      where: {
        id: id,
      },
    });
  }
}

export default PrayRepository;
