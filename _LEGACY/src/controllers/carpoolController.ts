import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import logger from '@utils/logger';
import CarpoolService from '@services/carpoolService';
import FcmService from '@services/fcmService';
import {
  CreateCarpoolDto,
  UpdateCarpoolInfoDto,
  UpdateCarpoolDto,
} from '@dtos/carpoolDto';

/**
 * @swagger
 * tags:
 *   name: Carpool
 *   description: Carpool management
 */
class CarpoolController {
  constructor() {
    this.getAllCarpoolRooms = this.getAllCarpoolRooms.bind(this);
    this.getCarpoolRoomById = this.getCarpoolRoomById.bind(this);
    this.getCarpoolRoomDetail = this.getCarpoolRoomDetail.bind(this);
    this.getMyCarpoolRooms = this.getMyCarpoolRooms.bind(this);
    this.createCarpoolRoom = this.createCarpoolRoom.bind(this);
    this.editCarpoolRoom = this.editCarpoolRoom.bind(this);
    this.updateCarpoolRoom = this.updateCarpoolRoom.bind(this);
    this.deleteCarpoolRoom = this.deleteCarpoolRoom.bind(this);
    this.joinCarpoolRoom = this.joinCarpoolRoom.bind(this);
    this.leaveCarpoolRoom = this.leaveCarpoolRoom.bind(this);
    this.updateCarpoolStatus = this.updateCarpoolStatus.bind(this);
    this.sendCarpoolStartNotificationMessage = this.sendCarpoolStartNotificationMessage.bind(this);
  }
  private carpoolService = new CarpoolService();
  private fcmService = new FcmService();

  /**
   * @swagger
   * /api/carpool:
   *   get:
   *     summary: Get all carpool rooms
   *     tags: [Carpool]
   *     responses:
   *       200:
   *         description: Get all carpool rooms success
   *       404:
   *         description: No carpool rooms found
   */
  async getAllCarpoolRooms(req: Request, res: Response<ApiResponse>) {
    try {
      const result: any = await this.carpoolService.getAllCarpoolRooms();
      if (result.ok) {
        logger.http('getAllCarpools');
        return res.status(200).json({
          success: true,
          message: 'Success getAllCarpools',
          data: {
            rooms: result.rooms,
          }
        });
      }
      if (result.message === 'No carpool rooms found') {
        logger.http('getAllCarpools');
        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            rooms: result.rooms
          }
        });
      }
      return res.status(404).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#getAllCarpools error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/{id}:
   *   get:
   *     summary: Get carpool room by ID
   *     tags: [Carpool]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Get carpool room success
   *       404:
   *         description: Carpool room not found
   */
  async getCarpoolRoomById(req: Request, res: Response<ApiResponse>) {
    try {
      const id = Number(req.params.id);
      const result: any = await this.carpoolService.getCarpoolRoomById(id);

      if (result.ok) {
        logger.http(`getCarpoolById(${id})`);
        return res.status(200).json({
          success: true,
          message: 'Success getCarpoolById',
          data: {
            room: result.room,
          }
        });
      }

      return res.status(404).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#getCarpoolById error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/detail/{id}:
   *   get:
   *     summary: Get carpool room detail
   *     tags: [Carpool]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Get carpool detail success
   *       400:
   *         description: Invalid ID
   *       404:
   *         description: Not found
   */
  async getCarpoolRoomDetail(req: Request, res: Response<ApiResponse>) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid carpool room ID' });
      }

      const result: any = await this.carpoolService.getCarpoolRoomDetail(id);
      if (result.ok) {
        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            room: result.room,
          }
        });
      }
      return res.status(404).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#getCarpoolRoomDetail error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/my/{userId}:
   *   get:
   *     summary: Get my carpool rooms
   *     tags: [Carpool]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Get my carpool rooms success
   *       400:
   *         description: Invalid User ID
   *       404:
   *         description: Not found
   */
  async getMyCarpoolRooms(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = Number(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid userId' });
      }

      const result: any = await this.carpoolService.findMyCarpoolRooms(userId);

      if (result.ok) {
        logger.http(`getMyCarpoolRooms(${userId})`);
        return res.status(200).json({
          success: true,
          message: 'Success getMyCarpoolRooms',
          data: {
            rooms: result.rooms,
          }
        });
      }
      if (result.message === 'No carpool rooms found') {
        logger.http('getMyCarpoolRooms');
        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            rooms: result.rooms
          }
        })
      }
      return res.status(404).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#getMyCarpoolRooms error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool:
   *   post:
   *     summary: Create carpool room
   *     tags: [Carpool]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               roomName:
   *                 type: string
   *               maxMember:
   *                 type: number
   *     responses:
   *       201:
   *         description: Create success
   *       400:
   *         description: Create failed
   */
  async createCarpoolRoom(req: Request, res: Response<ApiResponse>) {
    try {
      const dto: CreateCarpoolDto = req.body;
      const result: any = await this.carpoolService.createCarpoolRoom(dto);

      if (result.ok) {
        logger.http('createCarpool');
        return res.status(201).json({
          success: true,
          message: 'Success createCarpool',
          data: {
            room: result.room,
          }
        });
      }

      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#createCarpool error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/{id}:
   *   put:
   *     summary: Edit carpool room info
   *     tags: [Carpool]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: number
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               roomName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Edit success
   *       400:
   *         description: Edit failed
   */
  async editCarpoolRoom(req: Request, res: Response<ApiResponse>) {
    try {
      const id = Number(req.params.id);
      const dto: UpdateCarpoolInfoDto = req.body;
      const result: any = await this.carpoolService.editCarpoolRoom(id, dto);

      if (result.ok) {
        logger.http(`editCarpool(${id})`);
        return res.status(200).json({
          success: true,
          message: 'Success editCarpool',
          data: {
            room: result.room,
          }
        });
      }

      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#editCarpool error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/update/{id}:
   *   put:
   *     summary: Update carpool room
   *     tags: [Carpool]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: number
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               maxMember:
   *                 type: number
   *     responses:
   *       200:
   *         description: Update success
   *       400:
   *         description: Update failed
   */
  async updateCarpoolRoom(req: Request, res: Response<ApiResponse>) {
    try {
      const id = Number(req.params.id);
      const dto: UpdateCarpoolDto = req.body;
      const result: any = await this.carpoolService.updateCarpoolRoom(id, dto);

      if (result.ok) {
        logger.http(`updateCarpool(${id})`);
        return res.status(200).json({
          success: true,
          message: 'Success updateCarpool',
          data: {
            room: result.room,
          }
        });
      }

      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#updateCarpool error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/{id}:
   *   delete:
   *     summary: Delete carpool room
   *     tags: [Carpool]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Delete success
   *       400:
   *         description: Delete failed
   */
  async deleteCarpoolRoom(req: Request, res: Response<ApiResponse>) {
    try {
      const id = Number(req.params.id);
      const result: any = await this.carpoolService.deleteCarpoolRoom(id);

      if (result.ok) {
        logger.http(`deleteCarpool(${id})`);
        return res.status(200).json({ success: true, message: 'Success deleteCarpool' });
      }

      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#deleteCarpool error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/join:
   *   post:
   *     summary: Join carpool room
   *     tags: [Carpool]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               roomId:
   *                 type: number
   *     responses:
   *       201:
   *         description: Join success
   *       400:
   *         description: Join failed
   */
  async joinCarpoolRoom(req: Request, res: Response<ApiResponse>) {
    try {
      const { userId, roomId } = req.body;
      const result: any = await this.carpoolService.joinCarpoolRoom(userId, roomId);
      if (result.ok) {
        logger.http(`joinCarpoolRoom user:${userId} room:${roomId}`);
        return res.status(201).json({ success: true, message: 'Success joinCarpool' });
      }
      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#joinCarpoolRoom error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/leave:
   *   post:
   *     summary: Leave carpool room
   *     tags: [Carpool]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               roomId:
   *                 type: number
   *     responses:
   *       200:
   *         description: Leave success
   *       400:
   *         description: Leave failed
   */
  async leaveCarpoolRoom(req: Request, res: Response<ApiResponse>) {
    try {
      const { userId, roomId } = req.body;
      const result: any = await this.carpoolService.leaveCarpoolRoom(userId, roomId);
      if (result.ok) {
        logger.http(`leaveCarpoolRoom user:${userId} room:${roomId}`);
        return res.status(200).json({ success: true, message: 'Success leaveCarpool' });
      }
      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#leaveCarpoolRoom error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/status:
   *   post:
   *     summary: Update carpool status
   *     tags: [Carpool]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               roomId:
   *                 type: number
   *               newStatus:
   *                 type: string
   *     responses:
   *       200:
   *         description: Update status success
   *       400:
   *         description: Update status failed
   */
  async updateCarpoolStatus(req: Request, res: Response<ApiResponse>) {
    try {
      const { roomId, newStatus } = req.body;
      const result: any = await this.carpoolService.updateCarpoolStatus(roomId, newStatus);
      if (result.ok) {
        logger.http(`updateCarpoolStatus room:${roomId}, newStatus:${newStatus}`);
        return res.status(200).json({ success: true, message: 'Success updateCarpoolStatus' });
      }
      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#updateCarpoolStatus error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/carpool/notification/{id}:
   *   post:
   *     summary: Send carpool start notification
   *     tags: [Carpool]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Send notification success
   *       400:
   *         description: Send notification failed
   */
  async sendCarpoolStartNotificationMessage(req: Request, res: Response<ApiResponse>) {
    try {
      const roomId = Number(req.params.id);
      const result: any = await this.fcmService.sendCarpoolStartNotificationMessage(roomId);
      
      if (result.ok) {
        logger.http(`sendCarpoolStartNotificationMessage room:${roomId}`);
        return res.status(200).json({ success: true, message: 'Success sendStartMessages' });
      }
      return res.status(400).json({ success: false, message: result.message });
    } catch (err: any) {
      logger.error('CarpoolController#sendCarpoolStartNotificationMessage error:', err);
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }
}

export default CarpoolController;
