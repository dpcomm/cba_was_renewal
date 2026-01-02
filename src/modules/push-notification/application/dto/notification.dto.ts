export abstract class NotificationDto {
    abstract readonly title: string;
    abstract readonly body: string;
    abstract readonly channelId: string;
}