import express from "express";
import verifyAuth from "@middlewares/verifyAuth";
import DashboardController from "@controllers/dashboardController";

const dashboardRouter = express.Router();
const dashboardController = new DashboardController();

dashboardRouter.get('/', verifyAuth, dashboardController.getDashboard);

export default dashboardRouter;