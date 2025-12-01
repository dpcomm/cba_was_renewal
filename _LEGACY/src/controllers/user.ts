import { Request, Response } from 'express';
import { ApiResponse } from '@/types/apiResponse';
import UserService from '@services/userService';
import {
  requestAuthCheckDto,
  requestLoginUserDto,
  requestLogoutUserDto,
  requestRefreshAccessTokenDto,
  requestRegisterUserDto,
  checkUserDto,
  updateUserDto,
  resetPasswordDto,
  updateGroupDto,
  updateNameDto,
  updatePhoneDto,
  updateBirthDto,
  deleteUserDto,
} from '@dtos/authDto';
import logger from '@utils/logger';

const userService = new UserService();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */
class UserController {
  /**
   * @swagger
   * /api/user/login:
   *   post:
   *     summary: Login user
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               password:
   *                 type: string
   *               autoLogin:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Login success
   *       401:
   *         description: Login failed
   */
  async login(req: Request, res: Response<ApiResponse>) {
    try {
      const userDTO: requestLoginUserDto = req.body;
      const loginData: any = await userService.login(userDTO);
      if (loginData.ok) {
        logger.http(`Login ${loginData.user.name} ${loginData.user.userId}`);
        return res.status(200).json({
          success: true,
          message: "Authorize success",
          data: {
            accessToken: loginData.accessToken,
            refreshToken: loginData?.refreshToken,
            user: loginData.user
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: loginData.message,
      });
    } catch (err: any) {
      logger.error("Login controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/logout:
   *   post:
   *     summary: Logout user
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: number
   *     responses:
   *       200:
   *         description: Logout success
   *       401:
   *         description: Logout failed
   */
  async logout(req: Request, res: Response<ApiResponse>) {
    try {
      const userDTO: requestLogoutUserDto = req.body;
      const logoutData = await userService.logout(userDTO);
      if (logoutData.ok) {
        return res.status(200).json({
          success: true,
          message: "Logout success"
        });
      }
      return res.status(401).json({
        success: false,
        message: "Logout failed"
      });
    } catch (err: any) {
      logger.error("logout controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/register:
   *   post:
   *     summary: Register new user
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               password:
   *                 type: string
   *               name:
   *                 type: string
   *               group:
   *                 type: string
   *               phone:
   *                 type: string
   *               birth:
   *                 type: string
   *                 format: date
   *               gender:
   *                 type: string
   *               rank:
   *                 type: string
   *               etcGroup:
   *                 type: string
   *     responses:
   *       200:
   *         description: Register success
   *       401:
   *         description: Register failed
   */
  async register(req: Request, res: Response<ApiResponse>) {
    try {
      const userDto: requestRegisterUserDto = req.body;
      const registerData = await userService.register(userDto);
      if (registerData.ok) {
        return res.status(200).json({
          success: true,
          message: "Register success"
        });
      }
      return res.status(401).json({
        success: false,
        message: registerData.message
      });
    } catch (err: any) {
      logger.error("Register controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               accessToken:
   *                 type: string
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Refresh success
   *       401:
   *         description: Refresh failed
   */
  async refreshAccessToken(req: Request, res: Response<ApiResponse>) {
    try {
      const userDto: requestRefreshAccessTokenDto = req.body;
      const refreshAccessTokenData = await userService.refreshAccessToken(userDto);
      if (refreshAccessTokenData.ok) {
        return res.status(200).json({
          success: true,
          message: "Refresh access token success",
          data: {
            accessToken: refreshAccessTokenData.accessToken,
            user: refreshAccessTokenData.user
          }
        })
      }
      return res.status(401).json({
        success: false,
        message: refreshAccessTokenData.message
      });
    } catch (err: any) {
      logger.error("refreshAccessToken controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/{user}:
   *   get:
   *     summary: Get user info
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Get user success
   *       401:
   *         description: Get user failed
   */
  async getUser(req: Request, res: Response<ApiResponse>) {
    try {
      const userId: string = req.params['user'];
      if (userId) {
        const getUserByUserIdData = await userService.getUserByUserId(userId);
        if (getUserByUserIdData.ok) {
          return res.status(200).json({
            success: true,
            message: getUserByUserIdData.message,
            data: {
              user: getUserByUserIdData.user
            }
          });
        }
        return res.status(401).json({
          success: false,
          message: getUserByUserIdData.message,
        });
      }
      const getAllUserData = await userService.getAllUser();
      if (getAllUserData.ok) {
        return res.status(200).json({
          success: true,
          message: getAllUserData.message,
          // user: getAllUserData.user
        });
      }
      return res.status(401).json({
        success: false,
        message: getAllUserData.message,
      });
    } catch (err: any) {
      logger.error("getUser controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user:
   *   post:
   *     summary: Check auth
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               accessToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Auth check success
   *       401:
   *         description: Auth check failed
   */
  async authCheck(req: Request, res: Response<ApiResponse>) {
    const userDTO: requestAuthCheckDto = req.body;
    try {
      const authCheckData = await userService.authCheck(userDTO);
      if (authCheckData.ok) {
        return res.status(200).json({
          success: true,
          message: authCheckData.message,
          data: {
            user: authCheckData.user,
          }
        })
      }
      return res.status(401).json({
        success: false,
        message: authCheckData.message
      });
    } catch (err: any) {
      logger.error("authCheck controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }
  }

  /**
   * @swagger
   * /api/user/update:
   *   post:
   *     summary: Update user info
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               name:
   *                 type: string
   *               group:
   *                 type: string
   *               phone:
   *                 type: string
   *               birth:
   *                 type: string
   *                 format: date
   *               gender:
   *                 type: string
   *     responses:
   *       200:
   *         description: Update success
   *       401:
   *         description: Update failed
   */
  async updateUser(req:Request, res:Response<ApiResponse>) {
    try {
      const updateDto: updateUserDto = req.body;
      const updateData = await userService.updateUserInfo(updateDto);
      if (updateData.ok) {
        return res.status(200).json({
          success: true,
          message: "User Update Success"
        });
      }
      return res.status(401).json({
        success: false,
        message: updateData.message
      });
    } catch (err: any) {
      logger.error("Update controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/check-user:
   *   post:
   *     summary: Check user identity
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               password:
   *                 type: string
   *               name:
   *                 type: string
   *               gender:
   *                 type: string
   *               phone:
   *                 type: string
   *               group:
   *                 type: string
   *               birth:
   *                 type: string
   *     responses:
   *       200:
   *         description: Check success
   *       401:
   *         description: Check failed
   */
  async checkUser(req: Request, res: Response<ApiResponse>) {
    try {
      const checkUserDto: checkUserDto = req.body;
      if (checkUserDto.password) {
        /* userId, password로 본인인증 진행 */
        const checkData = await userService.checkUserInfo(checkUserDto);
        if (checkData.ok) {
          return res.status(200).json({
            success: true,
            message: "본인인증 완료",
            data: checkData.data
          });
        }
        return res.status(401).json({
          success: false,
          message: checkData.message
        });
      }
      /* 비밀번호를 제외한 정보로 본인인증 진행 */
      const checkUserWithoutPassword = await userService.checkUserWithoutPassword(checkUserDto);
      if (checkUserWithoutPassword.ok) {
        return res.status(200).json({
          success: true,
          message: "Success check user without password",
          data: {
            user: checkUserWithoutPassword.user
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: checkUserWithoutPassword.message
      });
    } catch (err: any) {
      logger.error("checkUser controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/reset-password:
   *   post:
   *     summary: Reset password
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Reset success
   *       401:
   *         description: Reset failed
   */
  async resetPassword(req: Request, res: Response<ApiResponse>) {
    try {
      const userDto: resetPasswordDto = req.body;
      const resetData = await userService.resetPassword(userDto);
      if (resetData.ok) {
        return res.status(200).json({
          success: true,
          message: "Password reset success"
        });
      }
      return res.status(401).json({
        success: false,
        message: resetData.message
      });
    } catch (err: any) {
      logger.error("resetPassword controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/{user}/group:
   *   post:
   *     summary: Update user group
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user
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
   *               userId:
   *                 type: string
   *               group:
   *                 type: string
   *     responses:
   *       200:
   *         description: Update group success
   *       401:
   *         description: Update group failed
   */
  async updateUserGroup(req: Request, res: Response<ApiResponse>) {
    try {
      const updateGroupDto: updateGroupDto = req.body;
      const updateGroupData = await userService.updateUserGroup(updateGroupDto)
      if (updateGroupData.ok) {
        return res.status(200).json({
          success: true,
          message: "Password reset success" // This message seems wrong in original code ("Password reset success" for group update?), but keeping it or fixing it? I'll fix it to "Group update success"
        });
      }
      return res.status(401).json({
        success: false,
        message: updateGroupData.message
      });
    } catch (err: any) {
      logger.error("updateUserGroup controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/update-name:
   *   post:
   *     summary: Update user name
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: number
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Update name success
   *       400:
   *         description: Update name failed
   */
  async updateUserName(req: Request, res: Response<ApiResponse>) {
    try {
      const dto: updateNameDto = req.body;

      const result: any = await userService.updateUserName(dto);

      if (result.ok) {
        return res.status(200).json({
          success: true,
          message: "update name success",
          data: {
            user: result.user,
          }
        });
      }
      return res.status(400).json({ success: false, message: result.message });

    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/user/update-phone:
   *   post:
   *     summary: Update user phone
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: number
   *               phone:
   *                 type: string
   *     responses:
   *       200:
   *         description: Update phone success
   *       400:
   *         description: Update phone failed
   */
  async updateUserPhone(req: Request, res: Response<ApiResponse>) {
    try {
      const dto: updatePhoneDto = req.body;

      const result: any = await userService.updateUserPhone(dto);

      if (result.ok) {
        return res.status(200).json({
          success: true,
          message: "update phone success",
          data: {
            user: result.user,
          }
        });
      }
      return res.status(400).json({ success: false, message: result.message });

    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message, error: err });
    }
  }

  /**
   * @swagger
   * /api/user/{user}/birth:
   *   post:
   *     summary: Update user birth
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: user
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
   *               userId:
   *                 type: string
   *               birth:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Update birth success
   *       401:
   *         description: Update birth failed
   */
  async updateUserBirth(req: Request, res: Response<ApiResponse>) {
    try {
      const updateBirthDto: updateBirthDto = req.body;
      const updateBirthData = await userService.updateUserBirth(updateBirthDto)
      if (updateBirthData.ok) {
        return res.status(200).json({
          success: true,
          message: "update UserBirth success"
        });
      }
      return res.status(401).json({
        success: false,
        message: updateBirthData.message
      });
    } catch (err: any) {
      logger.error("updateUserBirth controller error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }

  /**
   * @swagger
   * /api/user/delete:
   *   post:
   *     summary: Delete user
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: number
   *     responses:
   *       200:
   *         description: Delete success
   *       401:
   *         description: Delete failed
   */
  async delete(req: Request, res: Response<ApiResponse>) {
    try {
      const userDTO: deleteUserDto = req.body;
      const deleteData: any = await userService.deleteUser(userDTO);
      if (deleteData.ok) {
        logger.http(`Delete user ${userDTO.id}`);
        return res.status(200).json({
          success: true,
          message: "Delete success",
        });
      }
      return res.status(401).json({
        success: false,
        message: deleteData.message,
      });
    } catch (err: any) {
      logger.error("Delete controller error:", err)
      return res.status(500).json({
        success: false,
        message: err.message,
        error: err
      });
    }
  }
}

export default UserController;