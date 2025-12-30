import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT),
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_APP_KEY,
          },
          secure: true,
        },
        defaults: {
          from: process.env.MAIL_FROM,
        },
      }),
    })
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}