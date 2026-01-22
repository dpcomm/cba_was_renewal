import { NotificationDto } from "./notification.dto";

export abstract class CarpoolNotificationDto extends NotificationDto {
    readonly title = '카풀 안내';
    readonly channelId = 'carpool';
}

export class CarpoolJoinNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(userName: string) {
        super();
        this.body = `[${userName}]님이 카풀을 신청했습니다.`;
    }
}

export class CarpoolLeaveNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(userName: string) {
        super();
        this.body = `카풀 신청자 [${userName}]님이 신청을 취소했습니다.`;
    }
}

export class CarpoolUpdateNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor() {
        super();
        this.body = `중요!! 신청한 카풀 정보가 수정되었습니다. 앱에 접속하여 확인해주세요.`;
    }
}

export class CarpoolDeleteNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor() {
        super();
        this.body = `중요!! 신청한 카풀이 삭제되었습니다. 다른 카풀을 확인 및 신청해주세요.`;
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

export class CarpoolRemindNotificationDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor() {
        super();
        this.body = '오늘은 카풀 운행일입니다. 약속 장소와 시간을 다시 한 번 확인해주세요.';
    }
}

export class CarpoolTimeRemindNotificaionDto extends CarpoolNotificationDto {
    readonly body: string;

    constructor(remainingTime: string) {
        super();
        this.body = `카풀 운행 ${remainingTime} 전입니다. 약속 시간에 늦지 않게 도착해주세요.`;
    }
}