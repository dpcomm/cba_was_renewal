import { Logger, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly templatePath: string;
  private readonly logoPath: string;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    const basePath = this.resolveTemplateBasePath();
    this.templatePath = join(basePath, 'verification.html');
    this.logoPath = join(basePath, 'logo.png');
  }

  private resolveTemplateBasePath(): string {
    const configuredPath = this.configService.get<string>('MAIL_TEMPLATE_DIR');
    const candidates = [
      configuredPath
        ? join(process.cwd(), configuredPath)
        : join(process.cwd(), 'dist/src/infrastructure/mail/templates'),
      join(__dirname, 'templates'),
    ];

    const found = candidates.find((path) =>
      existsSync(join(path, 'verification.html')),
    );

    if (!found) {
      throw new Error(
        `Mail template path not found. Tried: ${candidates.join(', ')}`,
      );
    }

    return found;
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    this.logger.log(`[메일 발송] 인증 메일 전송 시작 -> ${to}`);

    let htmlTemplate = readFileSync(this.templatePath, 'utf-8');
    htmlTemplate = htmlTemplate.replace('${code}', code);

    await this.mailerService.sendMail({
      to,
      subject: '[CBA Connect] 이메일 인증 코드가 도착했습니다.',
      html: htmlTemplate,
      attachments: [
        {
          filename: 'logo.png',
          path: this.logoPath,
          cid: 'logo',
        },
      ],
    });
  }
}
