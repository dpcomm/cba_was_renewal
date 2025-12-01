import express from "express";
import YoutubeController from "@controllers/youtubeController";
import verifyAuth from "@middlewares/verifyAuth";

const youtubeRouter = express.Router();
const youtubeController = new YoutubeController();

youtubeRouter.get('/', verifyAuth, youtubeController.getYoutube);
youtubeRouter.post('/', verifyAuth, youtubeController.createYoutube);

export default youtubeRouter;