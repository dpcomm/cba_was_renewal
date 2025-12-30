import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../src/infrastructure/mail/mail.module';
import { MailService } from '../src/infrastructure/mail/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    MailModule,
  ],
})
class TestEmailModule {}

describe('Email Sending', () => {
  let mailService: MailService;
  let app: any;

  beforeAll(async () => {
    app = await NestFactory.createApplicationContext(TestEmailModule);
    mailService = app.get(MailService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should send verification email successfully', async () => {
    const targetEmail = process.env.TEST_EMAIL || 'jipkim2@gmail.com';
    console.log(`Sending test email to: ${targetEmail}`);
    
    await expect(
      mailService.sendVerificationEmail(targetEmail, '123456')
    ).resolves.not.toThrow();
  });
});
