import express from "express";
import ChatreportController from "@controllers/chatreportController";

const chatreportRouter = express.Router();
const chatreportController = new ChatreportController();

chatreportRouter.post("/report", chatreportController.report);

export default chatreportRouter;