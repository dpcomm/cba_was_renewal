export abstract class NotificationDto {
    abstract readonly title: string;
    abstract readonly body: string;
    abstract readonly channelId: string;
}

export class defaultNotificationDto extends NotificationDto {
    readonly channelId = 'default';
    readonly title: string;
    readonly body: string;

    constructor(title: string, body: string) {
        super();
        this.title = title;
        this.body = body;
    }
}