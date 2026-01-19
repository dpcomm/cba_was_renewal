import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository, DataSource, In } from "typeorm";
import { ExpoPushToken } from "@modules/expo-push-token/domain/entities/expo-push-token.entity";
import { registExpoPushTokenRequestDto } from "../dto/expo-push-token.request.dto";
import { User } from "@modules/user/domain/entities/user.entity";
import { ERROR_MESSAGES } from "@shared/constants/error-messages";

@Injectable()
export class ExpoPushTokenService {
    constructor(
        @InjectRepository(ExpoPushToken)
        private expoPushTokenRepository: Repository<ExpoPushToken>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async registToken(dto: registExpoPushTokenRequestDto): Promise<ExpoPushToken> {
        const user = await this.userRepository.findOne({
            where: { id: dto.userId },
        });

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // 1. 이미 등록된 토큰인지 확인
        const existingToken = await this.expoPushTokenRepository.findOne({
            where: { token: dto.token },
            relations: ['user'],
        });

        // 2. 이미 있으면 user교체, lastUsedAt 갱신
        if (existingToken) {
            if (existingToken.userId !== user.id){
                existingToken.user = user;
            }

            existingToken.lastUsedAt = new Date();
            return await this.expoPushTokenRepository.save(existingToken);
        }

        // 3. 없으면 신규 등록
        const newToken = this.expoPushTokenRepository.create({
            token: dto.token,
            provider: 'expo',
            user,
            lastUsedAt: new Date(),
        });

        return await this.expoPushTokenRepository.save(newToken);
    }

    async deleteToken(token: string): Promise<void> {
        await this.expoPushTokenRepository.delete({token});
    }

    async getTokens(userIds?: number | number[] ): Promise<ExpoPushToken[]> {

        if (userIds == null) {
            return this.expoPushTokenRepository.find();
        }

        const ids = Array.isArray(userIds) ? userIds : [userIds];

        if (ids.length === 0) {
            return [];
        }

        return this.expoPushTokenRepository.find({
            where: { userId: In(ids) },
        });

        // let tokens: ExpoPushToken[];

        // if (userId != null) {
        //     tokens = await this.expoPushTokenRepository.find({
        //         where: { userId },
        //     });
        // } else {
        //     tokens = await this.expoPushTokenRepository.find();
        // }

        // return tokens;
    }

    async deleteInvalidTokens(tokens: string[]): Promise<void> {
        if (!tokens || tokens.length === 0) {
            return;
        }

        await this.expoPushTokenRepository.delete(
            tokens.map((t) => ({ token: t })),
        );

        return ;
    }

}