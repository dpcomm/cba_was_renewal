import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { PUSH_SENDER_PORT, IPushSenderPort } from './ports/push-sender.port';
import { PushTokenService } from '@modules/push-token/application/push-token.service';

@Injectable()
export class NoticePushService {
  private readonly logger = new Logger(NoticePushService.name);

  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    @Inject(PUSH_SENDER_PORT)
    private readonly pushSender: IPushSenderPort,
    private readonly tokenService: PushTokenService,
  ) {}

  async sendNoticePush(
    id: number,
    options: {
      target?: number[];
      reserveTime?: string;
      includeBody?: boolean;
    },
  ): Promise<void> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
    });

    if (!notice) {
      throw new NotFoundException(ERROR_MESSAGES.NOTICE_NOT_FOUND);
    }

    const includeBody = options.includeBody !== false;
    const notification = {
      title: notice.title,
      body: includeBody ? notice.body : '',
      channelId: 'notice',
    };

    if (options.reserveTime) {
      await this.pushSender.reserve({
        title: notice.title,
        body: includeBody ? notice.body : '',
        reserveTime: options.reserveTime,
        target: options.target,
      });
      return;
    }

    const tokens = await this.tokenService.getTokens(options.target);
    await this.pushSender.send(tokens, notification);
    this.logger.log(
      `공지 푸시 발송: "${notice.title}" (공지ID: ${id}, 타겟: ${options.target ? options.target.join(',') : '전체'}, 토큰수: ${tokens?.length ?? 0})`,
    );
  }
}
