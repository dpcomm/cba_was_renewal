import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, DataSource } from 'typeorm';
import { FcmToken } from '@modules/fcm/domain/entities/fcm-token.entity';
import {
  registFcmTokenRequestDto,
  deleteFcmTokenRequestDto,
  refreshFcmTokenRequestDto,
  unregistFcmTokenRequestDto,
} from '../dto/fcm-token.request.dto';
import { Platform } from '@modules/fcm/domain/platform.enum';
import { User } from '@modules/user/domain/entities/user.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class FcmTokenService {
  constructor(
    @InjectRepository(FcmToken)
    private fcmTokenRepository: Repository<FcmToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  // token을 등록
  async registToken(dto: registFcmTokenRequestDto): Promise<FcmToken> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // 현재 등록 요청한 token이 DB에 존재하는지 확인
    const existing = await this.fcmTokenRepository.findOne({
      where: { token: dto.token },
    });

    if (existing) {
      // ───────────────────────────────────────────────
      // CASE 1. 토큰이 이미 있고 → 기존 userId가 null
      // → 아직 어떤 계정에도 귀속되지 않음 → 현재 user에게 귀속
      // ───────────────────────────────────────────────
      if (existing.userId == null) {
        existing.userId = user.id;
        existing.platform = dto.platform;
        return this.fcmTokenRepository.save(existing);
      }

      // ───────────────────────────────────────────────
      // CASE 2. 토큰이 있고 → 기존 userId == 현재 userId
      // → 이미 자신의 토큰 → 그대로 사용
      // ───────────────────────────────────────────────
      if (existing.userId === user.id) {
        // platform이 변경 되었을을 대비해 update
        if (existing.platform !== dto.platform) {
          existing.platform = dto.platform;
          return this.fcmTokenRepository.save(existing);
        }
        return existing;
      }

      // ───────────────────────────────────────────────
      // CASE 3. 토큰이 있고 → 다른 유저에게 귀속되어 있음
      // → 명백히 다른 계정의 토큰 → 에러
      // ───────────────────────────────────────────────
      throw new BadRequestException(ERROR_MESSAGES.FCM_TOKEN_ALREADY_REGISTED);
    }

    // ───────────────────────────────────────────────
    // CASE 4. 토큰이 DB에 처음 등록되는 경우
    // ───────────────────────────────────────────────
    const newToken = this.fcmTokenRepository.create({
      userId: user.id,
      token: dto.token,
      platform: dto.platform,
    });

    return this.fcmTokenRepository.save(newToken);
  }

  // 토큰 등록 해제 (userId가 NOT NULL이므로 레코드 삭제)
  // device의 token은 정상이지만 해당 토큰과 연결된 user가 없는 경우
  async unregistToken(dto: unregistFcmTokenRequestDto): Promise<boolean> {
    const existing = await this.fcmTokenRepository.findOne({
      where: { token: dto.token },
    });

    // token이 없으면 그대로 성공 처리
    if (!existing) {
      return true;
    }

    // userId가 NOT NULL이므로 토큰 레코드 삭제
    await this.fcmTokenRepository.delete({ token: dto.token });

    return true;
  }

  async refreshToken(
    dto: refreshFcmTokenRequestDto,
  ): Promise<{ oldToken: FcmToken; newToken: FcmToken }> {
    return this.fcmTokenRepository.manager.transaction(async (manager) => {
      // 1. oldToken 조회
      const existingOld = await manager.findOne(FcmToken, {
        where: { token: dto.oldToken },
      });

      if (!existingOld) {
        throw new NotFoundException('Old token not found');
      }

      // 2. 소유자 검증
      if (existingOld.userId !== dto.userId) {
        throw new BadRequestException('Old token does not belong to this user');
      }

      // 3. newToken 중복 여부 확인
      const existingNew = await manager.findOne(FcmToken, {
        where: { token: dto.newToken },
      });

      if (existingNew) {
        if (existingNew.userId === dto.userId) {
          return {
            oldToken: existingOld,
            newToken: existingNew,
          };
        }

        throw new BadRequestException(
          'New token already registered to another account',
        );
      }

      // 4. oldToken 삭제
      await manager.delete(FcmToken, { token: dto.oldToken });

      // 5. newToken 생성
      const newEntity = manager.create(FcmToken, {
        token: dto.newToken,
        userId: dto.userId,
        platform: dto.platform,
      });

      const savedNew = await manager.save(newEntity);

      return {
        oldToken: existingOld,
        newToken: savedNew,
      };
    });
  }

  // token 폐기
  async deleteToken(dto: deleteFcmTokenRequestDto): Promise<boolean> {
    await this.fcmTokenRepository.delete({
      token: dto.token,
    });

    return true;
  }

  async getTokens(userId?: number): Promise<FcmToken[]> {
    let tokens: FcmToken[];

    if (userId != null) {
      tokens = await this.fcmTokenRepository.find({
        where: { userId },
      });
    } else {
      tokens = await this.fcmTokenRepository.find();
    }

    return tokens;
  }

  async deleteInvalidTokens(tokens: string[]): Promise<void> {
    if (!tokens || tokens.length === 0) {
      return;
    }

    await this.fcmTokenRepository.delete(tokens.map((t) => ({ token: t })));

    return;
  }

  // TODO: Redis에 token 관리
  // 기존에는 chat기능으로 인하여 token을 redis에 적재 후 사용
  //  - chat 기능을 위한 알림 기능에서 빠른 전달이 요구되어 redis를 사용.
  //  - chat 기능으로 인해 알림 발생이 빈번할 것으로 예상
  // 현재 chat 기능의 비활성화로 인해 알림 전달이 비교적 빈번하지 않을 것으로 판단
  // 현재 구조로는 redis에 적재하는 과정이 오히려 불편하지 않을까 하여 보류.
  // 1. DB에서 Redis로 token 올려두기
  // 2. Redis에 올려져 있는 token 읽기
  // 3. Redis에 있는 token list에 token append하기
  // 4. Redis에 올라가 있는 토큰 지우기
}
