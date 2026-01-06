import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExpoNotificationService } from "./application/services/expo-notification/ExpoNotification.service";
import { FcmNotificationService } from "./application/services/FCM/FCMnotification.service";
import { ExpoNotificationSender } from "./application/services/expo-notification/ExpoNotification.sender";
import { ExpoPushTokenModule } from "@modules/expo-push-token/expo-push-token.module";
import { CarpoolModule } from "@modules/carpool/carpool.module";
import { UserModule } from "@modules/user/user.module";

@Module({
    imports: [
        ExpoPushTokenModule,
        CarpoolModule,
        UserModule,
    ],
    providers: [
        ExpoNotificationService, 
        ExpoNotificationSender,
    ],
    exports: [ExpoNotificationService],
})

export class PushNotificationModule {}