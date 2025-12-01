import redisClient from '@utils/redis';
import ChatRepository from '@repositories/chatRepository'
import ChatroomService from './chatroomService';

const chatRepository = new ChatRepository();
const chatroomService = new ChatroomService();

class ChatService {
    // redis에 있는 chat을 mysql로 이동
    async flushAllChats() {
        try {
            const roomIds = await chatroomService.getActiveRoomIds();

            for (const roomId of roomIds) {
                const redisKey = `chatroom:${roomId}:message`;

                const rawChats = await redisClient.zRange(redisKey, 0, -1);
                if (rawChats.length === 0) continue;

                const parsedChats = rawChats.map(raw => JSON.parse(raw));
                await chatRepository.saveChats(parsedChats);

                await redisClient.del(redisKey);

                console.log("flush all chats");
            }
        } catch (err) {
            throw err;
        }
    }
}

export default ChatService;