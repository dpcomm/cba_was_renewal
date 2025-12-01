import { Socket } from "socket.io";
import { chatDto } from "@dtos/chatDto";
import redisClient from "@utils/redis";
import FcmService from "@services/fcmService";
import stringify from "json-stable-stringify";

const fcmService = new FcmService();

export default async function(socket: Socket, chatDTO: chatDto, callback: Function) {
    try {
        if (!chatDTO) {
             callback({
                success: false,
                message: "Invalid chat request"
             });
        }

        const chat = {
            senderId: chatDTO.senderId,
            roomId: chatDTO.roomId,
            message: chatDTO.message,
            timestamp: new Date(),
        };

        //await redisClient.rPush(`chatroom:${chatDTO.roomId}:message`, JSON.stringify(chat));
        
        //timestamp를 score로 이용한 sorted set에 chat 저장
        await redisClient.zAdd(`chatroom:${chatDTO.roomId}:message`, [
            {
                score: chat.timestamp.getTime() + chat.senderId * 1e-5, 
                value: stringify(chat)!,
           }
        ]);
        
        //
        socket.to('chatroom:' + chatDTO.roomId).emit("chat", chat);

        fcmService.sendChatNotificationMessage(chatDTO);

        const result = {
            success: true,
            message: "chat sent",
            chat
        };

        callback(result);
        console.log("chat:", result.chat);
    } catch (err: any) {
        callback({status: "chat error", message: err.message, err: err })
    }
}