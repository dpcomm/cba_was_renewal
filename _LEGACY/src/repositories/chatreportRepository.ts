import { PrismaClient } from '@prisma/client';
import { chatreportDto } from '@dtos/chatreportDto';

const prisma = new PrismaClient();

class ChatreportRepository {
    async createReport(report: chatreportDto) {
        return await prisma.chatReport.create({
            data: {
                reporterId: report.reporterId,
                reportedUserId: report.reportedUserId,
                roomId: report.roomId,
                reason: report.reason,
            }
        })
    }
}

export default ChatreportRepository;