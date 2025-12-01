import { Socket } from "socket.io";
import redisClient from "@utils/redis";

export default async function (socket: Socket) {
    try {
        const rooms = Array.from(socket.rooms).filter(room => room != socket.id);
        for (const room of rooms) {
            socket.leave(room);
        }

        const userId = await redisClient.hGet("socketToUser", socket.id);
        await redisClient.hDel("userToSocket", String(userId));
        await redisClient.hDel("socketToUser", socket.id);
              
        
        console.log("user", socket.id, "disconnected");

    } catch (err: any) {
        throw err;
    }
}