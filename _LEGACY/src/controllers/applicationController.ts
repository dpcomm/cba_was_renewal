import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import logger from '@utils/logger';
import ApplicationService from '@services/applicationService';
import { EditApplicationAttendedAndFeePaidDtoType, requestApplicationDto } from '@dtos/surveyDto';

const applicationService = new ApplicationService();

/**
 * @swagger
 * tags:
 *   name: Application
 *   description: Application management
 */
class ApplicationController {
  /**
   * @swagger
   * /api/application/{user}/{retreatid}:
   *   get:
   *     summary: Get application by user and retreat ID
   *     tags: [Application]
   *     parameters:
   *       - in: path
   *         name: user
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: retreatid
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Get application success
   *       401:
   *         description: Get application failed
   */
  async getApplicationByUserIdAndRetreatId(req: Request, res: Response<ApiResponse>) {
    try {
      const userId: string = req.params['user'];
      const retreatId: number = parseInt(req.params['retreatid']);
      const getApplicationByUserIdAndRetreatIdData: any = await applicationService.getApplicationByUserIdAndRetreatId(userId, retreatId);
      if (getApplicationByUserIdAndRetreatIdData.ok) {
        logger.http(`getApplicationByUserIdAndRetreatId ${getApplicationByUserIdAndRetreatIdData.application.userId}`);
        return res.status(200).json({
          success: true,
          message: "Success request application by userId",
          data: {
            application: getApplicationByUserIdAndRetreatIdData.application
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: getApplicationByUserIdAndRetreatIdData.message,
      });
    } catch (err: any) {
      logger.error("Application controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/application/origin:
   *   get:
   *     summary: Get origin application
   *     tags: [Application]
   *     responses:
   *       200:
   *         description: Get origin application success
   *       401:
   *         description: Get origin application failed
   */
  async getOriginApplication(req: Request, res: Response<ApiResponse>) {
    try {
      const getAllApplicationData = await applicationService.getOriginApplication()
      if (getAllApplicationData.ok) {
        return res.status(200).json({
          success: true,
          message: getAllApplicationData.message,
          data: {
            application: getAllApplicationData.application
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: getAllApplicationData.message,
      });
    } catch (err: any) {
      logger.error("Application controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/application:
   *   get:
   *     summary: Get all applications
   *     tags: [Application]
   *     responses:
   *       200:
   *         description: Get all applications success
   *       401:
   *         description: Get all applications failed
   */
  async getApplication(req: Request, res: Response<ApiResponse>) {
    try {
      const getAllApplicationData = await applicationService.getAllApplication()
      if (getAllApplicationData.ok) {
        return res.status(200).json({
          success: true,
          message: getAllApplicationData.message,
          data: {
            application: getAllApplicationData.application
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: getAllApplicationData.message,
      });
    } catch (err: any) {
      logger.error("Application controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/application/attended-fee:
   *   post:
   *     summary: Edit application attended and fee paid
   *     tags: [Application]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: number
   *               attended:
   *                 type: boolean
   *               feePaid:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Update success
   *       401:
   *         description: Update failed
   */
  async EditApplicationAttendedAndFeePaid(req: Request, res: Response<ApiResponse>) {
    const applicationDto: EditApplicationAttendedAndFeePaidDtoType = req.body;
    console.log(applicationDto);
    try {
      const editApplicationAttendedAndFeePaidData: any = await applicationService.updateApplicationAttendedAndFeePaid(applicationDto);
      if (editApplicationAttendedAndFeePaidData.ok) {
        return res.status(200).json({
          success: true,
          message: editApplicationAttendedAndFeePaidData // This seems to be a message string in original code? Or object? Original: message: editApplicationAttendedAndFeePaidData
        });
      }
      return res.status(401).json({
        success: false,
        message: editApplicationAttendedAndFeePaidData.message
      });
    } catch(err: any) {
      logger.error("Application controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/application:
   *   post:
   *     summary: Create or update application
   *     tags: [Application]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               retreatId:
   *                 type: number
   *     responses:
   *       200:
   *         description: Success
   *       401:
   *         description: Failed
   */
  async postApplication(req: Request, res: Response<ApiResponse>) {
    try {
      const surveyDto: requestApplicationDto = req.body;
      const getApplicationByUserIdData: any = await applicationService.getApplicationByUserIdAndRetreatId(surveyDto.userId, surveyDto.retreatId);
      if (getApplicationByUserIdData.ok) {
          const updateApplication: any = await applicationService.updateApplication(surveyDto);
          if (updateApplication.ok) {
            return res.status(200).json({
              success: true,
              message: "Survey Update Success"
            });
          }
          return res.status(401).json({
            success: false,
            message: updateApplication.message
          });
      }
      const ApplicationData = await applicationService.addApplication(surveyDto);
      if (ApplicationData.ok) {
        return res.status(200).json({
          success: true,
          message: "Survey Add Success"
        });
      }
      return res.status(401).json({
        success: false,
        message: ApplicationData.message
      });
    } catch(err: any) {
      logger.error("Survey controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }
}

export default ApplicationController;