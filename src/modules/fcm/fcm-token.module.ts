import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FcmToken } from "./domain/entities/fcm-token.entity";
import { User } from "@modules/user/domain/entities/user.entity";
import { FcmTokenService } from "./application/services/fcm-token.service";
import { FcmTokenController } from "./presentation/controllers/fcm-token.controller";
import { FcmTokenMapper } from "./application/mappers/fcm-token.mapper";

@Module({
    imports: [TypeOrmModule.forFeature([FcmToken, User])],
    controllers: [FcmTokenController],
    providers: [FcmTokenService, FcmTokenMapper],
})
export class FcmTokenModule {}