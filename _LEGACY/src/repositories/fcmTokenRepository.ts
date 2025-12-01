import { requestRegistTokenDto, Token } from '@dtos/fcmTokenDto';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

class FcmTokenRepository {
    async registToken(tokenDTO: requestRegistTokenDto){
        return await prisma.fcmToken.create({
            data: {
                userId: tokenDTO.userId,
                token: tokenDTO.token,
                platform: tokenDTO.platform,
            }
        });
    }
    async deleteToken(token: string){
        return await prisma.fcmToken.delete({
            where: { token: token },
        });
    }
    async getTokens(userId: number): Promise<Token[]>{
        const result = await prisma.fcmToken.findMany({
            where: {
                userId: userId,
            },
        });

        return result;
    }
    async findToken(token: string) {
        return await prisma.fcmToken.findUnique({
            where: {
                token: token,
            }
        });
    }
}

export default FcmTokenRepository;