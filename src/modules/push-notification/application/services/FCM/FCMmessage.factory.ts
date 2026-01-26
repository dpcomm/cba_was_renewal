import { MulticastMessage } from 'firebase-admin/messaging';
import { NotificationDto } from '../../dto/notification.dto';
import { FcmNotificationBuilder } from './FCMmessage.builder';

export class FcmNotificationFactory {
  // 1) create normal notification message
  // notification + data + android + apns
  // 일괄전송
  // topicMessage 사용을 위해
  async createNotificationMessage(
    dto: NotificationDto,
    target: string[] | string,
  ) {
    const builder = new FcmNotificationBuilder();
    const message = builder
      .setTarget(target)
      .setNotification({
        title: dto.title,
        body: dto.body,
      })
      .setData({
        title: dto.title,
        body: dto.body,
        channelId: dto.channelId,
      })
      .setAndroidConfig()
      .setApnsConfig()
      .build();

    return message;
  }

  // 2) create notification message for android only
  // data + androidr
  // android 대상으로 프론트에서 UX를 제어하고 싶은 경우
  async createAndroidMessage() {}

  // 3) create notification message for ios only
  // notification + data + apns
  async createIosMessage() {}

  // 추후 chat기능이 생긴다면
  async createChatMessage() {}
}
