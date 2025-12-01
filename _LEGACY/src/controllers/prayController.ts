import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import logger from '@utils/logger';
import PrayService from '@services/prayService';
import { requestCreatePrayDto } from '@dtos/prayDto';

const prayService = new PrayService();

/**
 * @swagger
 * tags:
 *   name: Pray
 *   description: Pray management
 */
class PrayController {
  /**
   * @swagger
   * /api/pray:
   *   get:
   *     summary: Get all prays
   *     tags: [Pray]
   *     responses:
   *       200:
   *         description: Get all prays success
   *       401:
   *         description: Get all prays failed
   */
  async getAllPrays(req: Request, res: Response<ApiResponse>) {
    try {
      const getAllPrays: any = await prayService.getAllPrays();
      if (getAllPrays.ok) {
        logger.http(`getAllPrays`);
        return res.status(200).json({
          success: true,
          message: "Success request prays",
          data: {
            prays: getAllPrays.prays,
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: getAllPrays.message,
      });
    } catch (err: any) {
      logger.error("Pray controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err,
      });
    }
  }

  /**
   * @swagger
   * /api/pray:
   *   post:
   *     summary: Create pray
   *     tags: [Pray]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               content:
   *                 type: string
   *     responses:
   *       200:
   *         description: Create pray success
   *       401:
   *         description: Create pray failed
   */
  async createPray(req: Request, res: Response<ApiResponse>) {
    try {
      const prayDto: requestCreatePrayDto = req.body;
      const createPrayData: any = await prayService.createPray(prayDto);
      if (createPrayData.ok) {
        logger.http(`createPray`);
        return res.status(200).json({
          success: true,
          message: "Success create pray",
        });
      }
      return res.status(401).json({
        success: false,
        message: createPrayData.message,
      });
    } catch (err: any) {
      logger.error("Pray controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err,
      });
    }
  }

  /**
   * @swagger
   * /api/pray/{id}:
   *   delete:
   *     summary: Delete pray
   *     tags: [Pray]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Delete pray success
   *       401:
   *         description: Delete pray failed
   */
  async deletePray(req: Request, res: Response<ApiResponse>) {
    try {
      const id = Number(req.params.id);
      const deletePrayData: any = await prayService.deletePray(id);
      if (deletePrayData.ok) {
        logger.http(`deletePray`);
        return res.status(200).json({
          success: true,
          message: "Success delete pray",
        });
      }
      return res.status(401).json({
        success: false,
        message: deletePrayData.message,
      });
    } catch (err: any) {
      logger.error("Pray controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err,
      });
    }
  }
}

export default PrayController;
