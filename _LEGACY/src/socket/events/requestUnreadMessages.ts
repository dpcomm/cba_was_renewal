import { chatDto } from '@dtos/chatDto';
import redisClient from '@utils/redis';
import { Socket } from 'socket.io';
import ChatRepository from '@repositories/chatRepository';
import stringify from 'json-stable-stringify';

const chatRepository = new ChatRepository();
const MAX_MESSAGES = 50;

export default async function ( socket: Socket, recentChatDTO: chatDto, requestAll: boolean, callback: Function) {
    try {
        const redisKey = `chatroom:${recentChatDTO.roomId}:message`;
        const timestamp = new Date(recentChatDTO.timestamp).getTime() + recentChatDTO.senderId * 1e-5;

        console.log(`user${recentChatDTO.senderId} request unread message`);
        
        //채팅방에 처음 입장한 경우 - recent chat이 존재하지 않는 경우
        //alreadyEnter = true으로 설정되어 전송됨
        if (requestAll == true) {
            console.log(`user${recentChatDTO.senderId} request all unread messages`);    
            const mysqlChats: chatDto[] = await chatRepository.getAllChats(recentChatDTO.roomId);

            console.log("chats from mysql");
            console.log(mysqlChats);
            //mysql에서 획득한 chat을 redis에 cache
            if (mysqlChats.length > 0) {
                const redisZaddData = mysqlChats.map(chat => ({
                    score: new Date(chat.timestamp).getTime() + chat.senderId * 1e-5,
                    value: stringify(chat)!,
                }));
                await redisClient.zAdd(redisKey, redisZaddData);
            }
        } else {
            //채팅방에 이미 입장했던 경우 - recent chat이 존재하는 경우
            //redis에서 해당 chat의 위치를 찾기
            const exact = await redisClient.zRangeByScore(redisKey, timestamp, timestamp);

            //redis에 해당 chat이 없는 경우 DB에서 찾아오기
            if (exact.length <= 0) {
                console.log(`user${recentChatDTO.senderId} request some unread messages`);
                
                //현재 redis에 있는 가장 오래된 chat의 timestamp 구하기
                const redistOldestRaw = await redisClient.zRange(redisKey, 0, 0, { withScores: true } as any);
                const redisOldestScore = redistOldestRaw.length === 2 ? new Date(Math.trunc(Number(redistOldestRaw[1]))) : undefined;

                //구해진 timestamp구간의 chat을 DB로부터 획득 
                const mysqlChats: chatDto[] = await chatRepository.getChatsBetween(recentChatDTO.roomId, new Date(Math.trunc(timestamp)), redisOldestScore);

                //DB에서 획득한 chat을 redis에 cache
                if (mysqlChats.length > 0) {
                    const redisZaddData = mysqlChats.map(chat => ({
                        score: new Date(chat.timestamp).getTime() + chat.senderId * 1e-5,
                        value: stringify(chat)!,
                    }));
                    await redisClient.zAdd(redisKey, redisZaddData);
                }

                //const redisChatsRaw = redisOldestScore != undefined ? await redisClient.zRangeByScore(redisKey, redisOldestScore, '+inf') : [];

                //const redisChats = redisChatsRaw.map(chat => JSON.parse(chat) as chatDto);
            }

        }

        //redis에서 원하는 시점 이후의 chat을 획득
        const rawResults = await redisClient.zRangeByScore(
            redisKey, 
            requestAll? 0: timestamp,
            '+inf', 
            {
                LIMIT: {
                    offset: requestAll? 0 : 1,
                    count: MAX_MESSAGES,
                }
            }
        );
        const chats = rawResults.map(chat => JSON.parse(chat) as chatDto);
        
        console.log('result chat');
        console.log(chats);

        const result = {
            success: true,
            message: "unread messages",
            chats: chats,
        };

        callback(result);

    } catch (err: any) {
        callback({status: "unread message error", message: err.message, err: err })
    }

}