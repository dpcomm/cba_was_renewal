/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: 'success message'
 *         data:
 *           type: object
 *           nullable: true
 *         error:
 *           type: object
 *           nullable: true
 *           example: null
 *     ApiResponseEmptyData:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: 'success message'         
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: 'fail message'
 *         error:
 *           type: object
 *           nullable: true
 *           example: { code: 500 }
  *     ApiErrorResponseEmptyError:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: 'fail message'
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: any;
}
