import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import FcmService from '@services/fcmService';
import { requestRefreshTokenDto, requestRegistTokenDto, requestDeleteTokenDto, Token } from '@dtos/fcmTokenDto';
import logger from '@utils/logger';

const fcmService = new FcmService();

/**
 * @swagger
 * tags:
 *   name: FCM
 *   description: FCM Token management
 * components:
 *   schemas:
 *     RegistFCMTokenData:
 *       type: object
 *       required: 
 *         - userId
 *         - token
 *       properties:
 *         userId:
 *           type: integer
 *           example: 13
 *         token:
 *           type: string
 *           example: "exampletoken"
 *     DeleteFCMTokenData:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           example: "exampletokentoken"
 *     RefreshFCMTokenData:
 *       type: object
 *       required:
 *         - userId
 *         - oldToken
 *         - newToken
 *       properties:
 *         userId:
 *           type: integer
 *           example: 14
 *         oldToken:
 *           type: string
 *           example: "oldTokenexample"
 *         newToken:
 *           type: string
 *           example: "newTokenexample"
 */
class FcmTokenController {
    /**
     * @swagger
     * /api/fcm/register:
     *   post:
     *     summary: Register FCM token
     *     tags: [FCM]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userId:
     *                 type: string
     *               token:
     *                 type: string
     *               platform:
     *                 type: string
     *     responses:
     *       201:
     *         description: Register success
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/RegistFCMTokenData'
     *                     error: null
     *       400:
     *         description: Register failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
     *       500:
     *         description: FCM Token register error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'       
     */
    async registToken(req: Request, res: Response<ApiResponse>) {
        try {
            const tokenDTO: requestRegistTokenDto = req.body;
            const registData: any = await fcmService.registToken(tokenDTO);
            if (registData.ok) {
                logger.http(`Token Regist ${registData.userId} ${registData.token}`);
                
                const token: Token = {
                    userId: registData.userId,
                    token: registData.token,
                    platform: registData.platform,
                }

                await fcmService.addFirebaseToken(registData.userId, token);

                return res.status(201).json({
                    success: true,
                    message: "Token Regist success",
                    data: {
                        userId: registData.userId,
                        token: registData.token,
                    }
                });
            }
            console.log(`user ${registData.userId} regist token ${registData.token}`);
            return res.status(400).json({
                success: false,
                message: registData.message,
            });
        } catch (err: any) {
            logger.error("FCM Token register error:", err);
            return res.status(500).json({
                success: false,
                message: err.message,
                error: err
            });
        }

    }

    /**
     * @swagger
     * /api/fcm/delete:
     *   post:
     *     summary: Delete FCM token
     *     tags: [FCM]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: string
     *     responses:
     *       200:
     *         description: Delete success
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/DeleteFCMTokenData'
     *                     error: null
     *       400:
     *         description: Delete failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
     *       500:
     *         description: FCM Token delete error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'       
     */
    async deleteToken(req: Request, res: Response<ApiResponse>) {
        try {
            const tokenDTO: requestDeleteTokenDto = req.body;
            const removeData: any = await fcmService.deleteToken(tokenDTO);
            if (removeData.ok) {
                logger.http(`Token Remove ${removeData.token}`);

                await fcmService.removeFirebaseToken(removeData.userId, removeData.token);

                return res.status(200).json({
                    success: true,
                    message: "Token Remove success",
                    data: {
                        token: removeData.token,
                    }
                });
            }
            console.log(`remove token ${tokenDTO.token}`);
            return res.status(400).json({
                success: false,
                message: removeData.message,
            });
        } catch (err: any) {
            logger.error("FCM Token remove error:", err);
            return res.status(500).json({
                success: false,
                message: err.message,
                error: err
            });
        }
    }

    /**
     * @swagger
     * /api/fcm/refresh:
     *   post:
     *     summary: Refresh FCM token
     *     tags: [FCM]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userId:
     *                 type: string
     *               oldToken:
     *                 type: string
     *               newToken:
     *                 type: string
     *               platform:
     *                 type: string
     *     responses:
     *       200:
     *         description: Refresh success
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/RefreshFCMTokenData'
     *                     error: null
     *       400:
     *         description: Refresh failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponseEmptyError'
     *       500:
     *         description: FCM Token refresh error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'       
     */
    async refreshToken(req: Request, res: Response<ApiResponse>) {
        try {
            const refreshTokenDTO: requestRefreshTokenDto = req.body;
            const removeTokenDTO: requestDeleteTokenDto = {token: refreshTokenDTO.oldToken};
            const registTokenDTO: requestRegistTokenDto = {userId: refreshTokenDTO.userId, token: refreshTokenDTO.newToken, platform: refreshTokenDTO.platform};

            const removeData: any = await fcmService.deleteToken(removeTokenDTO);
            const registData: any = await fcmService.registToken(registTokenDTO);

            if (removeData.ok && registData.ok) {
                logger.http(`Token Refresh ${refreshTokenDTO.oldToken} to ${refreshTokenDTO.newToken}`);

                await fcmService.removeFirebaseToken(removeData.userId, removeData.token);   
                
                const token: Token = {
                    userId: registData.userId,
                    token: registData.token,
                    platform: registData.platform,
                }
                
                await fcmService.addFirebaseToken(registData.userId, token);

                return res.status(200).json({
                    success: true,
                    message: "Token Refresh success",
                    data: {
                        userId: refreshTokenDTO.userId,
                        oldToken: refreshTokenDTO.oldToken,
                        newToken: refreshTokenDTO.newToken,
                    }
                });
            }
            console.log(`refresh token ${refreshTokenDTO.oldToken} to ${refreshTokenDTO.newToken}`);
            return res.status(400).json({
                success: false,
                message: removeData.message + registData.message,
            });
        } catch (err: any) {
            logger.error("FCM Token refresh error:", err);
            return res.status(500).json({
                success: false,
                message: err.message,
                error: err
            });
        }
    }
}

export default FcmTokenController;