import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMIAL,
        pass: process.env.APP_PASSWORD,
      },
    });
  }

  async sendEmail(
    subject: string,
    body: string,
    recipient: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipient,
      subject: subject,
      text: body,
    };
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {}
  }
}
