import express from "express";
import CarpoolController from "@controllers/carpoolController";
import verifyAuth from "@middlewares/verifyAuth";

const carpoolRouter = express.Router();
const carpoolController = new CarpoolController();

/* 카풀 리스트 전체 출력 */
carpoolRouter.get("/", verifyAuth, carpoolController.getAllCarpoolRooms);
/* 상세 카풀 방 조회 */
carpoolRouter.get("/:id", verifyAuth, carpoolController.getCarpoolRoomById);
/* 상세 카풀 방 + 참여자 목록 조회 */
carpoolRouter.get("/detail/:id", verifyAuth, carpoolController.getCarpoolRoomDetail);
/* 마이카풀 리스트 전체 조회 */
carpoolRouter.get("/my/:userId", carpoolController.getMyCarpoolRooms);
/* 카풀 방 생성 */
carpoolRouter.post("/", verifyAuth, carpoolController.createCarpoolRoom);
/* 카풀 정보 수정 */
carpoolRouter.post("/edit/:id", verifyAuth, carpoolController.editCarpoolRoom);
/* 남은 카풀 좌석 업데이트, 도착 여부 업데이트 */
carpoolRouter.post("/update/:id", verifyAuth, carpoolController.updateCarpoolRoom);
/* 카풀 방 참여 */
carpoolRouter.post("/join", verifyAuth, carpoolController.joinCarpoolRoom);
/* 카풀 방 나가기 */
carpoolRouter.post("/leave", verifyAuth, carpoolController.leaveCarpoolRoom);
/* 카풀 방 삭제 */
carpoolRouter.post("/delete/:id", verifyAuth, carpoolController.deleteCarpoolRoom);
/* 카풀 상태 업데이트(출발, 도착) */
carpoolRouter.post("/status", verifyAuth, carpoolController.updateCarpoolStatus); 
/* 카풀 출발 알림 전송 */
carpoolRouter.post("/start/:id", verifyAuth, carpoolController.sendCarpoolStartNotificationMessage);

export default carpoolRouter;
