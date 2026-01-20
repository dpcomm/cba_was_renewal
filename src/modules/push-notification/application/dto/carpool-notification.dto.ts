import { NotificationDto } from "./notification.dto";

export abstract class CarpoolNotificationDto extends NotificationDto {
    readonly title = '카풀 알림';
    readonly channelId = 'carpool';
}

export class CarpoolJoinNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(userName: string, hostName: string) {
        super();
        this.body = `${userName}님이 ${hostName}님의 카풀에 참여하셨습니다.`;
    }
}

export class CarpoolLeaveNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(userName: string, hostName: string) {
        super();
        this.body = `${userName}님이 ${hostName}님의 카풀에서 떠나셨습니다.`;
    }
}

export class CarpoolUpdateNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(hostName: string) {
        super();
        this.body = `${hostName}님의 카풀이 수정되었습니다.`;
    }
}

export class CarpoolDeleteNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(hostName: string) {
        super();
        this.body = `${hostName}님의 카풀이 삭제되었습니다.`;
    }
}

export class CarpoolReadyNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor() {
        super();
        this.body = '카풀시작이 활성화되었습니다. 출발할 때 카풀 시작버튼을 눌러주세요.';
    }
}

export class CarpoolStartNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(hostName: string) {
        super();
        this.body = `${hostName}님의 카풀이 출발하였습니다.`;
    }
}