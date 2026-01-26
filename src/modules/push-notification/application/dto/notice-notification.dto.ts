import { NotificationDto } from './notification.dto';

export class NoticeNotificationDto extends NotificationDto {
  readonly title = '놓치면 아쉬운 공지가 있어요.';
  readonly channelId = 'notice';
  readonly body: string;

  constructor(body: string) {
    super();
    this.body = `[${body}]`;
  }
}
