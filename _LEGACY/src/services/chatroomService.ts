import redisClient from '@utils/redis';

class ChatroomService {
    //redis에 활성화되어있는-chat데이터가 cache되어 있는 chatroom찾기
    async getActiveRoomIds() {
        try {
            const roomIds = new Set<number>();
            let cursor = 0;
            
            do {
                const { cursor: nextCursor, keys } = await redisClient.scan(cursor, {
                    MATCH: 'chatroom:*:message',
                    COUNT: 100,
                });
                cursor = Number(nextCursor);

                for (const key of keys) {
                    const match = key.match(/^chatroom:(\d+):message$/);
                    if (match) {
                        roomIds.add(Number(match[1]));
                    }
                }
            } while (cursor != 0);

            return Array.from(roomIds);

        } catch (err) {
            throw err;
        }
    }
}

export default ChatroomService;