import { Inject, Injectable } from "@nestjs/common";
import { FcmToken } from "@modules/fcm/domain/entities/fcm-token.entity";
import { 
    FcmTokenResponseDto,
    FcmTokenRefreshResponse,
    FcmTokenSingleResponse
} from "@modules/fcm/presentation/dto/fcm-token.response.dto";

@Injectable()
export class FcmTokenMapper {

    toResponse(fcmToken: FcmToken): FcmTokenResponseDto {
        return {
            userId: fcmToken.userId,
            token: fcmToken.token,
            platform: fcmToken.platform
        };
    }

    toRefreshResponse(oldToken: FcmToken, newToken: FcmToken): FcmTokenRefreshResponse {
        return {
            oldToken: this.toResponse(oldToken),
            newToken: this.toResponse(newToken),
        };
    }

    toResponseOrNull(fcmToken: FcmToken | null): FcmTokenSingleResponse {
        return fcmToken? this.toResponse(fcmToken) : null;
    }

}