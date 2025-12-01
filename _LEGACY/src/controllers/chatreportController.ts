import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import ChatreportService from '@services/chatreportService';
import { chatreportDto } from '@dtos/chatreportDto';
import logger from '@utils/logger';

const chatreportService = new ChatreportService();

/**
 * @swagger
 * tags:
 *   name: Chatreport
 *   description: Chat report management
 */
class ChatreportController {
    /**
     * @swagger
     * /api/chatreport:
     *   post:
     *     summary: Report chat user
     *     tags: [Chatreport]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               reporter:
     *                 type: string
     *               reported:
     *                 type: string
     *               room:
     *                 type: number
     *               reason:
     *                 type: string
     *     responses:
     *       201:
     *         description: Report success
     *       400:
     *         description: Report failed
     */
    async report(req: Request, res: Response<ApiResponse>) {
        try{
            const reportDTO: chatreportDto = req.body;
            const reportData: any = await chatreportService.report(reportDTO);
            if (reportData.ok) {
                logger.http(`user ${reportData.reporter} reported user ${reportData.reported} in room ${reportData.room} becasue of ${reportData.reason}`);
                return res.status(201).json({
                    success: true,
                    message: "Report success",
                });
            }
            return res.status(400).json({
                success: false,
                message: reportData.message,
            });
        } catch (err: any) {
            logger.error("Report controller error:", err);
            return res.status(500).json({
                success: false,
                message: err.message,
                error: err,
            });
        }
    }
}

export default ChatreportController;