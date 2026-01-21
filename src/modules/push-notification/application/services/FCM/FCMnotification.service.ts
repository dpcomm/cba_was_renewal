// notification service
//
// 모든 notification의 절차는
// 1. 멤버 리스트 구하기
// 2. 해당 멤버의 토큰 리스트 구하기
// 3. 종류별 notificationDTO 생성 -> DTO 생성자를 통해서
// 4. dto와 token리스트를 통해서 message 생성 -> factory
// 5. 생성된 message를 전송 -> sender
// 
//
// chat이 다시 구현된다면 해당 기능은 반드시 token base로
// - chat의 경우 실시간성이 강조됨으로 지연될 가능성이 존재 하는 topic은 피하기
// 현재 일반적인 카풀, 공지, 일정 알림은 topic base로
// - member와 token들을 구하는 과정을 줄이기 위해 topic base로
// 
// 4?. 안드로이드와 ios 토큰을 분류
// 5?. 각각 형식에 맞게 전송.
//
//


import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationDto } from "../../dto/notification.dto";
import { NotificationType } from "@modules/push-notification/domain/notification-type.enum";
import { FcmMessageSender } from "./FCMmessage.sender";
import { FcmNotificationFactory } from "./FCMmessage.factory";
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

// 현재 TopicMessage를 사용하기 위한 구현
//
// 오류 등으로 인해 TopicMessage가 아닌 tokens based MulticastMessage로 전환된다면
// parameter와 내부 구현의 변경 예정
// CarpoolRepository, MemberRepository, TokenRepository등을 활용하여, 수신 대상자와 대상의 토큰 리스트를 확보하는 과정이 필요.
@Injectable()
export class FcmNotificationService {
    constructor(
        private readonly sender: FcmMessageSender,
        private readonly factory: FcmNotificationFactory,
    ) {}

    async notice(notice: string) {
        const dto = new NoticeNotificationDto(notice);
        const message = await this.factory.createNotificationMessage(dto, 'notice');
        await this.sender.send(message);
    }

    async noticeCarpoolJoin(userName: string, hostName: string, roomId: number) {
        const dto = new CarpoolJoinNotificationDto(userName, hostName);
        const message = await this.factory.createNotificationMessage(dto, 'carpool' + roomId);
        await this.sender.send(message);
    }

    async noticeCarpoolLeave(userName: string, hostName:string, roomId: number) {
        const dto = new CarpoolLeaveNotificationDto(userName, hostName);
        const message = await this.factory.createNotificationMessage(dto, 'carpool' + roomId);
        await this.sender.send(message);
    }

    async noticeCarpoolupdate(hostName:string, roomId: number) {
        const dto = new CarpoolUpdateNotificationDto(hostName);
        const message = await this.factory.createNotificationMessage(dto, 'carpool' + roomId);
        await this.sender.send(message);
    }

    async noticeCarpoolDelete(hostName:string, roomId: number) {
        const dto = new CarpoolDeleteNotificationDto(hostName);
        const message = await this.factory.createNotificationMessage(dto, 'carpool' + roomId);
        await this.sender.send(message);
    }

    async noticeCarpoolReady(hostName:string, roomId: number) {
        const dto = new CarpoolReadyNotificationDto();
        const message = await this.factory.createNotificationMessage(dto, 'carpool' + roomId);
        await this.sender.send(message);
    }

    async noticeCarpoolStart(hostName:string, roomId: number) {
        const dto = new CarpoolStartNotificationDto(hostName);
        const message = await this.factory.createNotificationMessage(dto, 'carpool' + roomId);
        await this.sender.send(message);
    }

    async noticeScheduleReady(programName: string, programLocation: string, remainingMinutes: number) {
        const dto = new ScheduleReadyNotificationDto(programName, programLocation, remainingMinutes);
        const message = await this.factory.createNotificationMessage(dto, programName);
        await this.sender.send(message);
    }

    async noticeScheduleStart(programName: string, programLocation: string) {
        const dto = new ScheduleStartNotificationDto(programName, programLocation);
        const message = await this.factory.createNotificationMessage(dto, programName);
        await this.sender.send(message);        
    }


}