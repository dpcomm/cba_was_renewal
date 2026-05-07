import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotificationAdminController } from './presentation/push-notification-admin.controller';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { SendNoticePushUseCase } from './application/usecases/send-notice-push.usecase';
import { SendPushMessageUseCase } from './application/usecases/send-push-message.usecase';
import { ReservePushUseCase } from './application/usecases/reserve-push.usecase';
import { CancelReservationUseCase } from './application/usecases/cancel-reservation.usecase';
import { PopDueReservationsUseCase } from './application/usecases/pop-due-reservations.usecase';
import { GetReservationsQuery } from './application/queries/get-reservations.query';

@Module({
  imports: [TypeOrmModule.forFeature([Notice]), RedisModule],
  controllers: [PushNotificationAdminController],
  providers: [
    SendNoticePushUseCase,
    SendPushMessageUseCase,
    ReservePushUseCase,
    CancelReservationUseCase,
    PopDueReservationsUseCase,
    GetReservationsQuery,
  ],
  exports: [ReservePushUseCase, PopDueReservationsUseCase],
})
export class PushNotificationModule {}
