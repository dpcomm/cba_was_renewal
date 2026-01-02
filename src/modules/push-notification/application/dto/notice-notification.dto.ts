import { NotificationDto } from "./notification.dto";

export class NoticeNotificationDto extends NotificationDto {
    readonly title = '공지 알림';
    readonly channelId = 'notice_channel';
    readonly body: string;
    
    constructor(body: string) {
        super();
        this.body = body;
    }
}