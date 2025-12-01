import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import logger from '@utils/logger';
import version from '@config/status.json';

/**
 * @swagger
 * tags:
 *   name: Status
 *   description: Status check
 */
class StatusController {
  /**
   * @swagger
   * /api/status/version:
   *   get:
   *     summary: Get application version
   *     tags: [Status]
   *     responses:
   *       200:
   *         description: Get version success
   *       500:
   *         description: Internal server error
   */
  async getApplicationVersion(req: Request, res: Response<ApiResponse>) {
    try {
      logger.http('Version check successful');
      return res.status(200).json({
        success: true,
        message: 'Version check successful',
        data: {
          version: version.application,
        }
      });
    } catch (err: any) {
      logger.error('Status controller error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
      });
    }
  }
}

export default StatusController;
