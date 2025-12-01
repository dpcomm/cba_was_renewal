import { PrismaClient } from '@prisma/client'
import { chatDto } from '@dtos/chatDto';


const prisma = new PrismaClient();

class ChatRepository {
    async saveChats(chats: chatDto[]) {
        const chatsToSave = chats.map(chat => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
        }));

        return prisma.chat.createMany({
            data: chatsToSave,
            skipDuplicates: true,
        });
    }
    async getAllChats(roomId: number): Promise<chatDto[]> {
        const result = await prisma.chat.findMany({
            where: { roomId },
            orderBy: { timestamp: 'asc' },
        });

        const chats: chatDto[] = result.map(chat => ({
            roomId: chat.roomId,
            senderId: chat.senderId,
            message: chat.message,
            timestamp: chat.timestamp.toISOString(),
        }));

        return chats;      
    }
    async getChatsBetween(roomId: number, fromTimestamp: Date, toTimestamp?: Date): Promise<chatDto[]> {
        const whereClause: any = {
            roomId,
            timestamp: {
                gte: fromTimestamp,
            },
        };

        if (toTimestamp !== undefined) {
            whereClause.timestamp = {
                ...whereClause.timestamp,
                lt: toTimestamp,
            };
        }

        const result = await prisma.chat.findMany({
            where: whereClause,
            orderBy: [
                {
                    timestamp: 'asc',
                },
                {
                    senderId: 'asc',
                },
            ],
        });

        const chats: chatDto[] = result.map(chat => ({
            roomId: chat.roomId,
            senderId: chat.senderId,
            message: chat.message,
            timestamp: chat.timestamp.toISOString(),
        }));

        return chats;       
    };    
    async getChatsForward(roomId: number, userId: number, timestamp: Date, limit: number): Promise<chatDto[]> {
        console.log(`limit: ${limit}`);
        const result = await prisma.chat.findMany({
            where: {
                roomId,
                OR: [
                    {
                        timestamp: {
                            lt: timestamp,
                        },
                    },
                    {
                        timestamp: {
                            equals: timestamp,
                        },
                        senderId: {
                            lt: userId,
                        },
                    },
                ],
            },
            orderBy: [
                {
                    timestamp: "desc",
                },
                {
                    senderId: "desc",
                },
            ],
            take: limit
        });

        const chats: chatDto[] = result.map(chat => ({
            senderId: chat.senderId,
            roomId: chat.roomId,
            message: chat.message,
            timestamp: chat.timestamp.toISOString(),
        }));

        return chats;   

    }

}

export default ChatRepository;