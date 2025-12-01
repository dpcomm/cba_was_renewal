import { Socket } from "socket.io";
import redisClient from "@utils/redis";
import CarpoolMemberRepository from "@repositories/carpoolMemberRepository";
import UserRepository from "@repositories/userRepository";

const carpoolMemberRepository = new CarpoolMemberRepository();
const userRepository = new UserRepository();

export default async function (socket: Socket, userId: number, callback?: Function) {
    try {
        
        await redisClient.hSet("userToSocket", String(userId), socket.id);
        await redisClient.hSet("socketToUser", socket.id, String(userId));

        const user: any = await userRepository.findUserById(userId);
        await redisClient.hSet("userInfo", String(userId), JSON.stringify(user));

        const carpools: number[] = await carpoolMemberRepository.findGroupsByUserId(userId);
        for (const carpool of carpools) {
            const member = await carpoolMemberRepository.findUserByCarpoolId(carpool);
            await redisClient.hSet("carpoolMember", carpool.toString(), JSON.stringify(member));
            socket.join(`chatroom:${carpool}`);
            console.log(`${userId} join to chatroom:${carpool}`);
            
        }
        const result = {
            success: true,
            message: "socket login success",
            userId: userId,
            socketId: socket.id
        };
        
        console.log(`user login: ${userId}`);
        if(callback) {
            callback(result);
        } else {
            return result;
        }

    } catch (err: any) {
        if(callback) {
            callback({status: "login error", message: err.message, err: err });            
        } else {
            return {status: "login error", message: err.message, err: err };
        }

    }
}