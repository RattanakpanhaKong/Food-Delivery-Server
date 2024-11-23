import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type mailOptions = {
  subject: string;
  email: string;
  name: string;
  activationCode: string;
  template: string;
};
@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}

  async sendMail({
    subject,
    email,
    template,
    name,
    activationCode,
  }: mailOptions) {
    await this.mailService.sendMail({
      from: 'Kun Khmer Kitchen <no-reply@kunkhmerkitchen.com>',
      to: email,
      subject,
      template,
      context: {
        name,
        activationCode,
      },
    });
  }
}
