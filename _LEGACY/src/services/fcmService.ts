import { chatDto } from "@dtos/chatDto";
import { MulticastMessage, getMessaging } from "firebase-admin/messaging";
import redisClient from '@utils/redis';
import FcmTokenRepository from "@repositories/fcmTokenRepository";
import { requestRegistTokenDto, requestDeleteTokenDto, Token } from "@dtos/fcmTokenDto";
import { notificationMessageDto } from "@dtos/notificationDto";
import CarpoolMemberRepository from "@repositories/carpoolMemberRepository";
import CarpoolRoomRepository from "@repositories/carpoolRoomRepository";

const fcmTokenRepository = new FcmTokenRepository();
const carpoolMemberRepository = new CarpoolMemberRepository();
const carpoolRoomRepository = new CarpoolRoomRepository();

class FcmService {
    async sendChatNotificationMessage(chat: chatDto) {
        try {
            console.log("send chat notification enter ");
            const result = await redisClient.hGet("carpoolMember", chat.roomId.toString());
            let memberList: number[] = [];
            if (result) {memberList = JSON.parse(result)}

            console.log("---------------------------------memberList-------------------------------------------");
            console.log(memberList);
            console.log("---------------------------------memberList-------------------------------------------");

            let tokens: Token[] = [];

            for (const member of memberList) {
                if ( member == chat.senderId) continue;
                const tempResult = await this.getFirebaseToken(member);

                if (  !tempResult || tempResult.length === 0 ) { await this.setFirebaseToken(member); }
                const memberTokens = await this.getFirebaseToken(member);
                if(memberTokens != null) { tokens = [...tokens, ...memberTokens]; }
            }

            console.log("---------------------------------tokens-------------------------------------------");
            console.log(tokens);
            console.log("---------------------------------tokens-------------------------------------------");

            this._sendChatMessage(tokens, chat);

        } catch (err: any) {
            throw err;            
        }        
    }  

    private async _sendChatMessage(tokens: Token[], chat: chatDto){
        try {
            console.log("send chat notification internal enter ");

            if(!tokens || tokens.length === 0) {
                console.log("tokens is not exist")
                return;
            }

            const rawSender = await redisClient.hGet("userInfo", chat.senderId.toString());
            var senderName;

            if (rawSender) { senderName = JSON.parse(rawSender)['name']; }

            let androidTokens: string[] = [];
            let iosTokens: string[] = [];
            
            for (const token of tokens) {
                if(token.platform == 'android') {
                    androidTokens.push(token.token);
                } else {
                    iosTokens.push(token.token);
                }
            }


            if (androidTokens && androidTokens.length !== 0) {
                console.log("androidTokens가 존재합니다.");

                //android message
                const androidMessage: MulticastMessage = {
                    tokens : androidTokens, 
                    data: {
                        roomId: `${chat.roomId}`,
                        title: `카풀 채팅방`,
                        body: `${senderName}: ${chat.message}`,       
                        channelId: "chat_channel",
                    },
                    // notification: {
                    //     title: `New message in Room ${chat.roomId}`,
                    //     body: `${chat.senderId}: ${chat.message}`,
                    // },
                    android: {
                        collapseKey: chat.roomId.toString(),
                        // notification: {
                        //     channelId: "chat_channel",
                        //     clickAction: "OPEN_CHATROOM",
                        // },
                    }, 
                    apns: {
                        headers: {
                            "apns-collapse-id": chat.roomId.toString(),
                        },
                        payload: {
                            aps: {
                                // category: "OPEN_CHATROOM",  // 여기가 clickAction에 해당됨
                            }
                        }
                    },
                } 


                //send androidMessage
                getMessaging().sendEachForMulticast(androidMessage)
                    .then(response => {
                        console.log('Successfully sent:', response.successCount);

                        // 유효하지 않은(에러 발생한) 토큰 추출
                        const invalidTokens:string[] = [];
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) {
                                // 대표적인 에러 코드: 'messaging/invalid-registration-token', 'messaging/registration-token-not-registered'
                                const code = resp.error?.code;
                                if (
                                code === 'messaging/invalid-registration-token' ||
                                code === 'messaging/registration-token-not-registered'
                                ) {
                                invalidTokens.push(androidMessage.tokens[idx]);
                                }
                            }
                        });

                        if (invalidTokens.length > 0) {
                            console.log('유효하지 않은 토큰:', invalidTokens);
                            // 이 토큰들을 DB 등에서 삭제 처리
                            this.deleteInvalidTokens(invalidTokens);
                        }
                    })
                    .catch(error => {
                        console.log('Error sending:', error);
                    });

            } 
            if (iosTokens && iosTokens.length !== 0) {
                console.log("iosTokens가 존재합니다.");
                //ios message    
                const iosMessage: MulticastMessage = {
                    tokens: iosTokens,
                    notification: {
                        title: '카풀 채팅방',
                        body: `${senderName}: ${chat.message}`,
                    },
                    data: {
                        roomId: `${chat.roomId}`,
                    },
                    apns: {
                        payload: {
                            aps: {
                                threadId: chat.roomId.toString(),
                            }
                        }
                    },
                }

                //send ios message
                getMessaging().sendEachForMulticast(iosMessage)
                    .then(response => {
                        console.log('Successfully sent:', response.successCount);

                        // 유효하지 않은(에러 발생한) 토큰 추출
                        const invalidTokens:string[] = [];
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) {
                                // 대표적인 에러 코드: 'messaging/invalid-registration-token', 'messaging/registration-token-not-registered'
                                const code = resp.error?.code;
                                if (
                                code === 'messaging/invalid-registration-token' ||
                                code === 'messaging/registration-token-not-registered'
                                ) {
                                invalidTokens.push(iosMessage.tokens[idx]);
                                }
                            }
                        });

                        if (invalidTokens.length > 0) {
                            console.log('유효하지 않은 토큰:', invalidTokens);
                            // 이 토큰들을 DB 등에서 삭제 처리
                            this.deleteInvalidTokens(invalidTokens);
                        }
                    })
                    .catch(error => {
                        console.log('Error sending:', error);
                    });
            }



        } catch (err: any) {
            throw err;
        }
    }

    async sendCarpoolEnterNotificationMessage(userId: number, roomId: number) {
        try {
            const result = await redisClient.hGet("carpoolMember", roomId.toString());
            let memberList: number[] = [];
            if (result) {memberList = JSON.parse(result);}

            let tokens: Token[] = [];

            for (const member of memberList) {
                if ( member == userId) continue;
                const tempResult = await this.getFirebaseToken(member);
                if ( !tempResult || tempResult.length === 0 ) { await this.setFirebaseToken(member);}
                const memberTokens = await this.getFirebaseToken(member);
                if(memberTokens != null) { tokens = [...tokens, ...memberTokens]; }
            }

            const userResult = await redisClient.hGet("userInfo", userId.toString());
            let userName: string = "";
            if (userResult) { userName = JSON.parse(userResult).name; }

            const notificationDTO: notificationMessageDto = {
                title: "카풀 알림",
                body: `${userName} 님이 카풀에 참여하셨습니다.`,
                channelId: "carpool_channel",
            }

            this._sendNotificationMessage(tokens, notificationDTO, roomId);

        } catch (err: any) {
            throw err;
        }
    }

    async sendCarpoolLeaveNotificationMessage(userId: number, roomId: number) {
        try {
            const result = await redisClient.hGet("carpoolMember", roomId.toString());
            let memberList: number[] = [];
            if (result) {memberList = JSON.parse(result);}

            let tokens: Token[] = [];

            for (const member of memberList) {
                if ( member == userId) continue;
                const tempResult = await this.getFirebaseToken(member);
                if ( !tempResult || tempResult.length === 0 ) { await this.setFirebaseToken(member);}
                const memberTokens = await this.getFirebaseToken(member);
                if(memberTokens != null) { tokens = [...tokens, ...memberTokens]; }
            }

            const userResult = await redisClient.hGet("userInfo", userId.toString());
            let userName: string = "";
            if (userResult) { userName = JSON.parse(userResult).name; }            

            const notificationDTO: notificationMessageDto = {
                title: "카풀 알림",
                body: `${userName} 님이 카풀에서 떠나셨습니다.`,
                channelId: "carpool_channel",
            }

            this._sendNotificationMessage(tokens, notificationDTO, roomId);         

        } catch (err: any) {
            throw err;
        }
    }

    async sendCarpoolReadyNotificationMessage(roomId: number) {
        try {
            const driver = await carpoolRoomRepository.getDriver(roomId);

            let tokens: Token[] = [];

            if(driver != null) {
                const tempResult = await this.getFirebaseToken(driver);
                if ( !tempResult || tempResult.length === 0 ) { await this.setFirebaseToken(driver);}
                const memberTokens = await this.getFirebaseToken(driver);
                if(memberTokens != null) { tokens = [...tokens, ...memberTokens]; }
            }

            const notificationDTO: notificationMessageDto = {
                title: "카풀 알림",
                body: "카풀시작이 활성화되었습니다. 출발할 때 카풀 시작버튼을 눌러주세요.",
                channelId: "carpool_channel",
            }

            this._sendNotificationMessage(tokens, notificationDTO, roomId);

        } catch (err: any) {
            throw err;
        }
    }

    async sendCarpoolStartNotificationMessage(roomId: number) {
        try {
            const memberList = await carpoolMemberRepository.findUserByCarpoolId(roomId);
            const driver = await carpoolRoomRepository.getDriver(roomId);

            let tokens: Token[] = [];

            for (const member of memberList) {
                if ( member == driver) continue;
                const tempResult = await this.getFirebaseToken(member);
                if ( !tempResult || tempResult.length === 0 ) { await this.setFirebaseToken(member);}
                const memberTokens = await this.getFirebaseToken(member);
                if(memberTokens != null) { tokens = [...tokens, ...memberTokens]; }
            }

            const notificationDTO: notificationMessageDto = {
                title: "카풀 알림",
                body: "카풀 운전자가 출발했습니다. 카풀 장소에 시간에 늦지않게 도착해주세요.",
                channelId: "carpool_channel",
            }

            await this._sendNotificationMessage(tokens, notificationDTO, roomId);
            return { ok: true, message: '카풀 출발 알림 전송 요청 성공'};

        } catch (err: any) {
            throw err;
        }
    }

    private async _sendNotificationMessage(tokens: Token[], notificationMessage: notificationMessageDto, roomId: number) {
        try {

            if(!tokens || tokens.length === 0) {
                console.log("tokens is not exist")
                return;
            }
            

            let androidTokens: string[] = [];
            let iosTokens: string[] = [];
            
            for (const token of tokens) {
                if(token.platform == 'android') {
                    androidTokens.push(token.token);
                } else {
                    iosTokens.push(token.token);
                }
            }



            if (androidTokens && androidTokens.length !== 0) {

                //android message
                const message: MulticastMessage = {
                    tokens: androidTokens,
                    data: {
                        title: notificationMessage.title,
                        body: notificationMessage.body,
                        channelId: notificationMessage.channelId,
                    },
                    android: {
                        // notification: {
                        //     channelId: notificationMessage.channelId,
                        // },
                    }, 
                    apns: {
                        headers: {
                            
                        },
                        payload: {
                            aps: {
                                // category: "OPEN_CHATROOM",  // 여기가 clickAction에 해당됨
                            }
                        }
                    },
                }

                getMessaging().sendEachForMulticast(message)
                    .then(response => {
                        console.log('Successfully sent:', response.successCount);
                    })
                    .catch(error => {
                        console.log('Error sending:', error);
                    });            
            }

            if (iosTokens && iosTokens.length !== 0) {

                //ios message
                const iosMessage: MulticastMessage = {
                    tokens: iosTokens,
                    notification: {
                        title: notificationMessage.title,
                        body: notificationMessage.body,
                    },
                    data: {
                        roomId: `${roomId}`,
                    },
                    apns: {
                        payload: {
                            aps: {
                                threadId: roomId.toString(),
                            }
                        }
                    },
                }

                //send ios message
                getMessaging().sendEachForMulticast(iosMessage)
                    .then(response => {
                        console.log('Successfully sent:', response.successCount);

                        // 유효하지 않은(에러 발생한) 토큰 추출
                        const invalidTokens:string[] = [];
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) {
                                // 대표적인 에러 코드: 'messaging/invalid-registration-token', 'messaging/registration-token-not-registered'
                                const code = resp.error?.code;
                                if (
                                code === 'messaging/invalid-registration-token' ||
                                code === 'messaging/registration-token-not-registered'
                                ) {
                                invalidTokens.push(iosMessage.tokens[idx]);
                                }
                            }
                        });

                        if (invalidTokens.length > 0) {
                            console.log('유효하지 않은 토큰:', invalidTokens);
                            // 이 토큰들을 DB 등에서 삭제 처리
                            this.deleteInvalidTokens(invalidTokens);
                        }
                    })
                    .catch(error => {
                        console.log('Error sending:', error);
                    });            
                }


        } catch (err: any) {
            throw err;
        }
    }

    //set tokens from redis
    async setFirebaseToken(userId: number) {
        try {
            const hashKey = "userFirebaseToken";
            const tokens = await fcmTokenRepository.getTokens(userId);

            if(tokens == null || (tokens.length === 0)) { return; }
            await redisClient.hSet(hashKey, userId.toString(), JSON.stringify(tokens));
        } catch (err: any) {
            throw err;
        }

    }

    //get tokens from redis
    async getFirebaseToken(userId: number) {
        try {
            const hashKey = "userFirebaseToken";
            const result = await redisClient.hGet(hashKey, userId.toString());

            return result? JSON.parse(result) : [];
        } catch (err: any) {
            throw err;
        }
    }

    //append token to redis
    async addFirebaseToken(userId: number, token: Token) {
        try {
            const hashKey = "userFirebaseToken";

            const existing = await redisClient.hGet(hashKey, userId.toString());
            let tokens: Token[] = [];

            if (existing) { tokens = JSON.parse(existing); }
            tokens.push(token);
            await redisClient.hSet(hashKey, userId.toString(), JSON.stringify(tokens));
        } catch (err: any) {
            throw err;
        }
    }

    //remove token to redis
    async removeFirebaseToken(userId: number, token: string) {
        try {
            const hashKey = "userFirebaseToken";

            const existing = await redisClient.hGet(hashKey, userId.toString());
            let tokens: Token[] = [];

            if (existing) { tokens = JSON.parse(existing); }
            const result = tokens.filter(t => t.token !== token);
            await redisClient.hSet(hashKey, userId.toString(), JSON.stringify(result));

        } catch (err: any) {
            throw err;
        }
    }

    //regist token to DB
    async registToken(tokenDTO: requestRegistTokenDto) {
        try {
            //token 유효성 검사 필요
            if (!tokenDTO) {
                return ({
                    ok: 0,
                    message: "Invalid request"
                });
            }

            await fcmTokenRepository.registToken(tokenDTO);
            return ({
                ok: 1,
                message: "Token Resigter success",
                userId: tokenDTO.userId,
                token: tokenDTO.token,
            });
        } catch (err) {
            throw err;
        }
    }

    //remove token to DB
    async deleteToken(tokenDTO: requestDeleteTokenDto) {
        try {
            if (!tokenDTO) {
                return ({
                    ok: 0,
                    message: "Invalid request"
                });
            }

            const result = await fcmTokenRepository.deleteToken(tokenDTO.token);
            return ({
                ok: 1,
                message: "Token remove success",
                userId: result.userId,
                token: result.token,
            });

        } catch (err) {
            throw err;
        }
    }

    async deleteInvalidTokens(tokens: string[]) {
        try {
            for (const token of tokens) {
                const user = await fcmTokenRepository.findToken(token);
                const deleteTokenDTO: requestDeleteTokenDto = {
                    token: token,
                };

                if(user != null) {
                    await this.removeFirebaseToken(user?.userId, token);
                    await this.deleteToken(deleteTokenDTO);
                    console.log(`delete invalid token: ${token}`);
                }
            }

        } catch (err) {
            throw err;
        }
    }
}

export default FcmService;