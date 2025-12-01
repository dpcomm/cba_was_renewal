import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import logger from '@utils/logger';
import YoutubeService from '@services/youtubeService';
import { requestCreateYoutubeDto } from '@dtos/youtubeDto';

const youtubeService = new YoutubeService();

/**
 * @swagger
 * tags:
 *   name: Youtube
 *   description: Youtube management
 */
class YoutubeController {
  /**
   * @swagger
   * /api/youtube:
   *   get:
   *     summary: Get all youtube links
   *     tags: [Youtube]
   *     responses:
   *       200:
   *         description: Get youtube success
   *       401:
   *         description: Get youtube failed
   */
  async getYoutube(req: Request, res: Response<ApiResponse>) {
    try {
      const getAllYoutube: any = await youtubeService.getAllYoutube();
      if (getAllYoutube.ok) {
        logger.http(`getAllYoutube`);
        return res.status(200).json({
          success: true,
          message: "Success request youtube",
          data: {
            youtube: getAllYoutube.youtube
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: getAllYoutube.message,
      });
    } catch (err: any) {
      logger.error("Youtube controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }


  /**
   * @swagger
   * /api/youtube:
   *   post:
   *     summary: Create youtube link
   *     tags: [Youtube]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               link:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create youtube success
   *       401:
   *         description: Create youtube failed
   */
  async createYoutube(req: Request, res: Response<ApiResponse>) {
    try {
      const youtubeDto: requestCreateYoutubeDto = req.body;
      const createYoutubeData: any = await youtubeService.createYoutube(youtubeDto);
      if (createYoutubeData.ok) {
        logger.http(`createYoutube`);
        return res.status(200).json({
          success: true,
          message: "Success create youtube link"
        });
      }
      return res.status(401).json({
        success: false,
        message: createYoutubeData.message,
      });
    } catch (err: any) {
      logger.error("Youtube controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }
}

export default YoutubeController;