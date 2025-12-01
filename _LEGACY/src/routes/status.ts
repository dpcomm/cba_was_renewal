import express from "express";
import StatusController from "@controllers/statusController";
import verifyAuth from "@middlewares/verifyAuth";

const statusRouter = express.Router();
const statusController = new StatusController();

statusRouter.get('/version/application', statusController.getApplicationVersion);

export default statusRouter;
