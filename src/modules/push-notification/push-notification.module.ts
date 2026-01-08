import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExpoNotificationService } from "./application/services/expo-notification/ExpoNotification.service";
import { FcmNotificationService } from "./application/services/FCM/FCMnotification.service";
import { CarpoolRoom } from "@modules/carpool/domain/entities/carpool-room.entity";
import { CarpoolMember } from "@modules/carpool/domain/entities/carpool-member.entity";
import { User } from "@modules/user/domain/entities/user.entity";
import { ExpoPushToken } from "@modules/expo-push-token/domain/entities/expo-push-token.entity";

@Module({
    providers: [ExpoNotificationService],
    exports: [ExpoNotificationService],
})

export class PushNotificationModule {}