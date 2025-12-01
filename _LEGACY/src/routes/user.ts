import UserController from "@controllers/user";
import verifyAuth from "@middlewares/verifyAuth";
import express from "express";

const userRouter = express.Router();
const userController = new UserController();

userRouter.get('/:user?', userController.getUser);
userRouter.post('/', verifyAuth, userController.authCheck);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
userRouter.post('/register', userController.register);
userRouter.post('/refresh', userController.refreshAccessToken);
userRouter.post('/update', verifyAuth, userController.updateUser);
userRouter.post('/check-user', userController.checkUser);
userRouter.post('/reset-password', userController.resetPassword);
userRouter.post('/:user/group', userController.updateUserGroup);
userRouter.post('/:user/birth', userController.updateUserBirth);
userRouter.post('/update-name', verifyAuth, userController.updateUserName);
userRouter.post('/update-phone', verifyAuth, userController.updateUserPhone);
userRouter.post('/delete', verifyAuth, userController.delete);

export default userRouter;