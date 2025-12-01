import express from "express";
import PrayController from "@controllers/prayController";
import verifyAuth from "@middlewares/verifyAuth";

const prayRouter = express.Router();
const prayController = new PrayController();

prayRouter.get('/', prayController.getAllPrays);
prayRouter.post('/', verifyAuth, prayController.createPray);
prayRouter.delete('/:id', verifyAuth, prayController.deletePray);

export default prayRouter;
