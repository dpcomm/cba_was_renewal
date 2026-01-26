import { NotificationDto } from './notification.dto';

export abstract class ScheduleNotificationDto extends NotificationDto {
  readonly title = '일정 알림';
  readonly channelId = 'schedule';
}

export class ScheduleReadyNotificationDto extends ScheduleNotificationDto {
  readonly body: string;

  constructor(
    programName: string,
    programLocation: string,
    remainingMinutes: number,
  ) {
    super();
    this.body =
      `${programName}이 시작하기 현재 ${remainingMinutes}분 남았습니다.\n` +
      `${programLocation}로 모여주세요.`;
  }
}

export class ScheduleStartNotificationDto extends ScheduleNotificationDto {
  readonly body: string;

  constructor(programName: string, programLocation: string) {
    super();
    this.body =
      `${programName}이 시작되었습니다.` +
      `아직 참석하지 못하신 분들은 ${programLocation}로 모여주세요.`;
  }
}
