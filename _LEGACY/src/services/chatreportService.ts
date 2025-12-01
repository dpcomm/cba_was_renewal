import { chatreportDto } from "@dtos/chatreportDto";
import ChatreportRepository from "@repositories/chatreportRepository";

const chatreportRepository = new ChatreportRepository();

class ChatreportService {
    async report(reportDTO: chatreportDto) {
        try {
            await chatreportRepository.createReport(reportDTO);
            return ({
                ok: 1,
                message: "User Report Success",
                reporter: reportDTO.reporterId,
                reported: reportDTO.reportedUserId,
                roomId: reportDTO.roomId,
                reason: reportDTO.reason,
            })

        } catch (err: any) {
            throw err;
        }
    }
}

export default ChatreportService;