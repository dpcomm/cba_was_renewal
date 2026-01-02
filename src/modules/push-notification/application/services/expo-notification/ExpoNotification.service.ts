import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationDto } from "../../dto/notification.dto";
import { NotificationType } from "@modules/push-notification/domain/notification-type.enum";
import { ExpoNotificationSender } from "./ExpoNotification.sender";
import { ExpoPushTokenService } from "@modules/expo-push-token/application/services/expo-push-token.service";
import { CarpoolService } from "@modules/carpool/application/services/carpool.service";
import { UserService } from "@modules/user/application/user.service";
import { NoticeNotificationDto } from "../../dto/notice-notification.dto";
import { 
    CarpoolDeleteNotificationDto, 
    CarpoolJoinNotificationDto, 
    CarpoolLeaveNotificationDto, 
    CarpoolReadyNotificationDto, 
    CarpoolStartNotificationDto, 
    CarpoolUpdateNotificationDto 
} from "../../dto/carpool-notification.dto";
import { 
    ScheduleReadyNotificationDto, 
    ScheduleStartNotificationDto 
} from "../../dto/schedule-notification.dto";

@Injectable()
export class ExpoNotificationService {
    constructor(
        private readonly sender: ExpoNotificationSender,
        private readonly expoService: ExpoPushTokenService,
        private readonly carpoolService: CarpoolService,
        private readonly userService: UserService,
    ) {}

    async notice(notice: string) {
        const dto = new NoticeNotificationDto(notice);
        const tokenList = await this.expoService.getTokens();
        await this.sender.send(tokenList, dto);
    }

    async noticeCarpoolJoin(userId: number, roomId: number) {
        const userName = (await this.userService.findOneById(userId)).name;
        const driverName = await this.carpoolService.getDriverName(roomId);
        const dto = new CarpoolJoinNotificationDto(userName, driverName);

        const members = await this.carpoolService.getCarpoolMembers(roomId);
        const tokens = await this.expoService.getTokens(members)

        await this.sender.send(tokens, dto);
    }

    async noticeCarpoolLeave(userId: number, roomId: number) {
        const userName = (await this.userService.findOneById(userId)).name;
        const driverName = await this.carpoolService.getDriverName(roomId);
        const dto = new CarpoolLeaveNotificationDto(userName, driverName);

        const members = await this.carpoolService.getCarpoolMembers(roomId);
        const tokens = await this.expoService.getTokens(members)

        await this.sender.send(tokens, dto);
    }

    async noticeCarpoolupdate(roomId: number) {
        const driverName = await this.carpoolService.getDriverName(roomId);
        const dto = new CarpoolUpdateNotificationDto(driverName);

        const members = await this.carpoolService.getCarpoolMembers(roomId);
        const tokens = await this.expoService.getTokens(members)

        await this.sender.send(tokens, dto);
    }

    async noticeCarpoolDelete(roomId: number) {
        const driverName = await this.carpoolService.getDriverName(roomId);
        const dto = new CarpoolDeleteNotificationDto(driverName);

        const members = await this.carpoolService.getCarpoolMembers(roomId);
        const tokens = await this.expoService.getTokens(members)

        await this.sender.send(tokens, dto);
    }

    async noticeCarpoolReady(roomId: number) {
        const driverName = await this.carpoolService.getDriverName(roomId);
        const dto = new CarpoolReadyNotificationDto(driverName);

        const members = await this.carpoolService.getCarpoolMembers(roomId);
        const tokens = await this.expoService.getTokens(members)

        await this.sender.send(tokens, dto);
    }

    async noticeCarpoolStart(roomId: number) {
        const driverName = await this.carpoolService.getDriverName(roomId);
        const dto = new CarpoolStartNotificationDto(driverName);

        const members = await this.carpoolService.getCarpoolMembers(roomId);
        const tokens = await this.expoService.getTokens(members)

        await this.sender.send(tokens, dto);
    }


    // program의 member를 구하는 방법이 아직 정해지지 않았기에 추후 구현 예정.
    // async noticeScheduleReady(programName: string, programLocation: string, remainingMinutes: number) {
    //     const dto = new ScheduleReadyNotificationDto(programName, programLocation, remainingMinutes);
    //     const message = await this.factory.createNotificationMessage(dto, programName);
    //     await this.sender.send(message);
    // }

    // async noticeScheduleStart(programName: string, programLocation: string) {
    //     const dto = new ScheduleStartNotificationDto(programName, programLocation);
    //     const message = await this.factory.createNotificationMessage(dto, programName);
    //     await this.sender.send(message);        
    // }

}