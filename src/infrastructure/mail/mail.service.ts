import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly templatePath: string;
  private readonly logoPath: string;

  constructor(private readonly mailerService: MailerService) {
    const basePath = __dirname.includes('dist') 
      ? join(__dirname, 'templates')
      : join(__dirname, 'templates');
    this.templatePath = join(basePath, 'verification.html');
    this.logoPath = join(basePath, 'logo.png');
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    console.log(`[MailService] Sending verification email to ${to}`);
    
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
