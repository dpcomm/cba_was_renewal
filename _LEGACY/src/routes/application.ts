import verifyAuth from "@middlewares/verifyAuth";
import express from "express";
import ApplicationController from "@controllers/applicationController";

const applicationRouter = express.Router();
const applicationController = new ApplicationController();

applicationRouter.get('/originManagement/', applicationController.getOriginApplication);
applicationRouter.get('/management/', applicationController.getApplication);
applicationRouter.post('/management/', applicationController.EditApplicationAttendedAndFeePaid);
applicationRouter.get('/:user/:retreatid?', applicationController.getApplicationByUserIdAndRetreatId);
applicationRouter.post('/', verifyAuth, applicationController.postApplication);

/*
/api/application POST 요청 시,
1. 해당 유저에 대한 설문지 작성 여부 확인 -> SELECT * FROM Application WHERE userId = "유저아이디";
2.1. 설문지가 없는 경우
  - PRISMA CREATE 설문지
2.2. 설문지가 있는 경우
  - PRISMA UPDATE 설문지
*/

export default applicationRouter;