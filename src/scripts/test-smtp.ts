import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env.prod
dotenv.config({ path: join(__dirname, '../../.env.prod') });

async function sendTestEmail(to: string) {
  console.log('Loading configuration from .env.prod...');
  console.log('Host:', process.env.MAIL_HOST);
  console.log('Port:', process.env.MAIL_PORT);
  console.log('User:', process.env.MAIL_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false, // Port 587 uses STARTTLS
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_APP_KEY,
    },
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP Connection verified!');

    console.log(`Sending test email to ${to}...`);
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
      to: to,
      subject: 'CBA WAS Renewal - SMTP Test',
      text: 'This is a test email to verify Oracle Cloud SMTP configuration.',
      html: '<b>This is a test email</b> to verify Oracle Cloud SMTP configuration.',
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

// Get recipient from command line args
const recipient = process.argv[2];
if (!recipient) {
  console.error('Please provide a recipient email address as an argument.');
  process.exit(1);
}

sendTestEmail(recipient);
