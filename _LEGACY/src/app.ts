import "@config/env"; // Must be the first import
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "@routes/user";
import logger from "@utils/logger";
import redisClient from "@utils/redis";
import applicationRouter from "@routes/application";
import youtubeRouter from "@routes/youtube";
import prayRouter from "@routes/pray";
import dashboardRouter from "@routes/dashboard";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocketEvents } from "@socket/socket";
import "@utils/cron";
import carpoolRouter from "@routes/carpool";
import "@firebase/firebaseAdmin";
import fcmRouter from "@routes/fcmToken";
import statusRouter from "@routes/status";
import chatreportRouter from "@routes/chatreport";
import consentRouter from "@routes/consent";
import swaggerUi from "swagger-ui-express";
import specs from "@config/swagger";

const app = express();

redisClient.connect().catch(logger.error);
redisClient.on('connect', () => { logger.info("Redis connected on redis container") });
redisClient.on('error', (err: any) => { logger.error(`Redis client error`, err) });

const httpServer = createServer(app);
const io = new Server(httpServer);

setupSocketEvents(io);

app.use(cors());
app.use(bodyParser.json());

app.use("/api/status", statusRouter);
app.use("/api/user", userRouter);
app.use("/api/consent", consentRouter);
app.use("/api/application", applicationRouter);
app.use("/api/youtube", youtubeRouter);
app.use("/api/pray", prayRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/carpool", carpoolRouter);
app.use("/api/fcm", fcmRouter);
app.use("/api/chatreport", chatreportRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

httpServer.listen(process.env.SERVER_PORT, () => {
	logger.info(`Server app listening on port ${process.env.SERVER_PORT}`);
});