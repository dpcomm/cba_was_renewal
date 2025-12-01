// lib/routes/consent.ts
import express from "express";
import ConsentController from "@controllers/consentController";
import verifyAuth from "@middlewares/verifyAuth";

const consentRouter = express.Router();
const consentController = new ConsentController();


consentRouter.get("/", consentController.getAllConsents);
consentRouter.get("/:userId/:consentType", consentController.getConsent);
consentRouter.post("/", verifyAuth, consentController.createConsent);
// consentRouter.put("/:userId/:consentType", verifyAuth, consentController.updateConsent);
consentRouter.delete("/:userId/:consentType", verifyAuth, consentController.deleteConsent);

export default consentRouter;
