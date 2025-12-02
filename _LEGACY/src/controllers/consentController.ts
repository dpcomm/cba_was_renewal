import { Request, Response } from "express";
import { ApiResponse } from '@/types/apiResponse';
import ConsentService from "@services/consentService";
import logger from "@utils/logger";
import { requestCreateConsentDto } from "@dtos/consentDto";

const consentService = new ConsentService();

/**
 * @swagger
 * tags:
 *   name: Consent
 *   description: Consent management
 * components:
 *   schemas:
 *     Consent:
 *       type: object
 *       required:
 *         - userId
 *         - consentType
 *         - consentedAt
 *         - value
 *       properties:
 *         userId:
 *           type: integer
 *           example: 12
 *         consentType:
 *           type: string
 *           example: "marketing"
 *         consentedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-02-05T12:34:56.000Z"
 *         value:
 *           type: boolean
 *           example: true
 *
 *     Consents:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Consent'
 *       example:
 *         - userId: 12
 *           consentType: "marketing"
 *           consentedAt: "2025-02-05T12:34:56.000Z"
 *           value: true
 *         - userId: 12
 *           consentType: "sms"
 *           consentedAt: "2025-02-05T12:35:20.000Z"
 *           value: false 
 */
class ConsentController {
  /**
   * @swagger
   * /api/consent:
   *   get:
   *     summary: Get all consents
   *     tags: [Consent]
   *     responses:
   *       200:
   *         description: Get all consents success
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data: 
   *                       $ref: '#/components/schemas/Consents'
   *                     error: null
   *       404:
   *         description: Consents not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
   *       500:
   *         description: ConsentController getAllConsents error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async getAllConsents(req: Request, res: Response<ApiResponse>) {
    try {
      const { ok, message, consents } = await consentService.getAllConsents();
      if (ok) {
        logger.http("getAllConsents");
        return res.status(200).json({ 
          success: true,
          message: "Success fetch consents", 
          data: {
            consents 
          }
        });
      }
      return res.status(404).json({ success: false, message });
    } catch (err: any) {
      logger.error("ConsentController.getAllConsents error", err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/consent/{userId}/{consentType}:
   *   get:
   *     summary: Get consent by user and type
   *     tags: [Consent]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: number
   *       - in: path
   *         name: consentType
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Get consent success
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data: 
   *                       $ref: '#/components/schemas/Consent'
   *                     error: null
   *       404:
   *         description: Consent not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
   *       500:
   *         description: ConsentController getConsent error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async getConsent(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = Number(req.params.userId);
      const consentType = req.params.consentType;
      const { ok, message, consent } = await consentService.getConsent(userId, consentType);
      logger.http("getConsent");
      if (ok && consent) {
        return res.status(200).json({ 
          success: true,
          message: "Success fetch consent", 
          data: {
            consent 
          }
        });
      }
      if (message === "Consent not found") {
        return res.status(200).json({ 
          success: true,
          message: message, 
          data: {
            consent: null 
          }
        });
      }
      return res.status(404).json({ success: false, message });
    } catch (err: any) {
      logger.error("ConsentController.getConsent error", err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/consent:
   *   post:
   *     summary: Create consent
   *     tags: [Consent]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: number
   *               consentType:
   *                 type: string
   *               value:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Create consent success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseEmptyData'
   *       400:
   *         description: Create consent failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
   *       500:
   *         description: ConsentController createConsent error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async createConsent(req: Request, res: Response<ApiResponse>) {
    try {
      console.log('Helo', req.body);
      const dto: requestCreateConsentDto = req.body;
      const { ok, message } = await consentService.createConsent(dto);
      if (ok) {
        logger.http("createConsent");
        return res.status(201).json({ success: true, message: "Success create consent" });
      }
      return res.status(400).json({ success: false, message });
    } catch (err: any) {
      logger.error("ConsentController.createConsent error", err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/consent/{userId}/{consentType}:
   *   put:
   *     summary: Update consent
   *     tags: [Consent]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: number
   *       - in: path
   *         name: consentType
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               value:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Update consent success
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data: 
   *                       $ref: '#/components/schemas/Consent'
   *                     error: null
   *       400:
   *         description: Update consent failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
   *       500:
   *         description: ConsentController updateConsent error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async updateConsent(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = Number(req.params.userId);
      const consentType = req.params.consentType;
      const value: boolean = req.body.value;
      const { ok, message, consent } = await consentService.updateConsent(userId, consentType, value);
      if (ok) {
        logger.http("updateConsent");
        return res.status(200).json({ 
          success: true,
          message: "Success update consent", 
          data: {
            consent 
          }
        });
      }
      return res.status(400).json({ success: false, message });
    } catch (err: any) {
      logger.error("ConsentController.updateConsent error", err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/consent/{userId}/{consentType}:
   *   delete:
   *     summary: Delete consent
   *     tags: [Consent]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: number
   *       - in: path
   *         name: consentType
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Delete consent success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseEmptyData'
   *       400:
   *         description: Delete consent failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
   *       500:
   *         description: ConsentController deleteConsent error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async deleteConsent(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = Number(req.params.userId);
      const consentType = req.params.consentType;
      const { ok, message } = await consentService.deleteConsent(userId, consentType);
      if (ok) {
        logger.http("deleteConsent");
        return res.status(200).json({ success: true, message: "Success delete consent" });
      }
      return res.status(400).json({ success: false, message });
    } catch (err: any) {
      logger.error("ConsentController.deleteConsent error", err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }
}

export default ConsentController;