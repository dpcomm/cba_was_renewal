import { MulticastMessage, TopicMessage, AndroidConfig, ApnsConfig, Notification } from "firebase-admin/messaging";
import { ANDROID_BASE_POLICY, APNS_BASE_POLICY } from "./notification.policy";

type Target = string | string[];

export class NotificationBuilder {
    private message: Partial<MulticastMessage & TopicMessage> = {};
    
    setData(data: Record<string, string>): this {
        this.message.data = data;
        return this;
    }

    setNotification(notification: Notification): this {
        this.message.notification = notification;
        return this;
    }

    setAndroidConfig(androidConfig?: AndroidConfig): this {
        this.message.android = androidConfig? androidConfig: ANDROID_BASE_POLICY;
        return this;
    }

    setApnsConfig(apnsConfig?: ApnsConfig): this {
        this.message.apns = apnsConfig? apnsConfig: APNS_BASE_POLICY;
        return this;
    }

    setTarget(target: Target): this {
        if (Array.isArray(target)) {
            this.message.tokens = target; // → MulticastMessage
        } else {
            this.message.topic = target;   // → TopicMessage
        }
        return this;
    }

    // setTokens(tokens: string[]): this {
    //     this.message.tokens = tokens;
    //     return this;
    // }

    // setTopic(topic: string): this {
    //     this.message.topic = topic;
    //     return this;
    // }

    build(): MulticastMessage | TopicMessage {
        const hasTokens = Array.isArray(this.message.tokens) && this.message.tokens.length > 0;
        const hasTopic = typeof this.message.topic === 'string';

        // 검증
        if (hasTokens && hasTopic) {
            throw new Error("Cannot set multiple targets at once: tokens, topic are mutually exclusive");
        }

        if (!hasTokens && !hasTopic) {
            throw new Error("No target set: you must provide tokens, a topic");
        }

        // 타입 반환
        if (hasTokens) return this.message as MulticastMessage;
        return this.message as TopicMessage;
    }
    


}