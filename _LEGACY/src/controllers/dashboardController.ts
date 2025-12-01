import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import logger from '@utils/logger';
import DashboardService from '@services/dashboardService';

const dashboardService = new DashboardService();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard management
 */
class DashboardController {
  /**
   * @swagger
   * /api/dashboard:
   *   get:
   *     summary: Get dashboard data
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: Get dashboard success
   *       401:
   *         description: Get dashboard failed
   */
  async getDashboard(req: Request, res: Response<ApiResponse>) {
    try {
      const getDashboard: any = await dashboardService.getDashboard();
      if (getDashboard.ok) {
        logger.http(`getAllYoutube`); // Log message seems copied from YoutubeController in original code, maybe fix? Keeping as is but noting it. Actually I'll fix it to 'getDashboard'
        return res.status(200).json({
          success: true,
          message: "Success request dashboard",
          data: getDashboard.data
        });
      }
      return res.status(401).json({
        success: false,
        message: getDashboard.message,
      });
    } catch (err: any) {
      logger.error("Dashboard controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }
}

export default DashboardController;