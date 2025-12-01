import { Socket } from "socket.io";
import redisClient from "@utils/redis";

export default async function (socket: Socket, userId: number, callback: Function) {
    try {
        const rooms = Array.from(socket.rooms).filter(room => room != socket.id);
        for (const room of rooms) {
            socket.leave(room);
        }

        await redisClient.hDel("userToSocket", String(userId));
        await redisClient.hDel("socketToUser", socket.id);

        const result = {
            success: true,
            message: "socket logout success",
            userId: userId,
            socketId: socket.id
        };
        
        console.log(`user logout: ${userId}`);
        callback(result);

    } catch (err: any) {
        callback({status: "logout error", message: err.message, err: err })
    }

}