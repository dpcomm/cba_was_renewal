import { PrismaClient } from '@prisma/client';
import { requestCreateConsentDto } from '@dtos/consentDto';

const prisma = new PrismaClient();

class ConsentRepository {
  async findAllConsents() {
    return await prisma.consent.findMany();
  }

  async createConsent(consentDto: requestCreateConsentDto) {
    return await prisma.consent.create({
      data: {
        userId: consentDto.userId,
        consentType: consentDto.consentType,
        value: consentDto.value,
      },
    });
  }

  async findConsentByUserIdAndType(userId: number, consentType: string) {
    return await prisma.consent.findUnique({
      where: {
        userId_consentType: { userId, consentType },
      },
    });
  }

  async updateConsent(userId: number, consentType: string, value: boolean) {
    return await prisma.consent.update({
      where: {
        userId_consentType: { userId, consentType },
      },
      data: {
        value,
      },
    });
  }

  async deleteConsent(userId: number, consentType: string) {
    return await prisma.consent.delete({
      where: {
        userId_consentType: { userId, consentType },
      },
    });
  }
}

export default ConsentRepository;