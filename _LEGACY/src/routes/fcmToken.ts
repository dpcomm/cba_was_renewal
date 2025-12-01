import FcmTokenController from "@controllers/fcmTokenController";
import express from "express";

const fcmRouter = express.Router();
const fcmTokenController = new FcmTokenController();

fcmRouter.post('/regist', fcmTokenController.registToken);
fcmRouter.post('/delete', fcmTokenController.deleteToken);
fcmRouter.post('/refresh', fcmTokenController.refreshToken);

export default fcmRouter;