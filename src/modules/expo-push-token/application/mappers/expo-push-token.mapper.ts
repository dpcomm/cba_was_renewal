import { Injectable } from "@nestjs/common";
import { ExpoPushToken } from "@modules/expo-push-token/domain/entities/expo-push-token.entity";
import { 
    ExpoPushTokenResponseDto,
    ExpoPushTokenListResponse,
    ExpoPushTokenSingleResponse
} from "@modules/expo-push-token/presentation/dto/expo-push-token.response.dto";

@Injectable()
export class ExpoPushTokenMapper {
    toResponse(expoToken: ExpoPushToken): ExpoPushTokenResponseDto {
        return {
            userId: expoToken.userId,
            token: expoToken.token,
        };
    }

    toResponseList(expoTokens: ExpoPushToken[]): ExpoPushTokenListResponse {
        return expoTokens.map((expoToken) => this.toResponse(expoToken));
    }

    toResponseOrNull(expoToken: ExpoPushToken | null): ExpoPushTokenSingleResponse {
        return expoToken? this.toResponse(expoToken) : null;
    }
}