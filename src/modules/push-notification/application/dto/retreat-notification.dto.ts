import { NotificationDto } from './notification.dto';

export abstract class RetreatNotificationDto extends NotificationDto {
  readonly channelId = 'retreat';
}

export class RetreatCheckInNotificationDto extends RetreatNotificationDto {
  readonly title: string;
  readonly body: string;

  constructor() {
    super();
    this.title = '수련회 체크인';
    this.body = '앱으로 현장 등록하면 접수가 빨라져요. (숨은 선물 받기)';
  }
}

export class RetreatDayNotificationDto extends RetreatNotificationDto {
  readonly title: string;
  readonly body: string;

  constructor() {
    super();
    this.title = '수련회 D-DAY';
    this.body = '드디어 수련회 첫 날, 은혜 가득한 시간 함께 해요!';
  }
}
