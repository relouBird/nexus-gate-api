import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ServiceConfiguration } from '@nexus/configuration';

@Injectable()
export class MailService {
  private transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;
  private sender: string;

  // constructor(private configService: ConfigService) {
  //   const host = this.configService.get('NEXUSGATE_SMTP_HOST');
  //   const port = this.configService.get('NEXUSGATE_SMTP_PORT');
  //   const user = this.configService.get('NEXUSGATE_SMTP_USER');
  //   const pass = this.configService.get('NEXUSGATE_SMTP_PASS');

  //   if (!host || !port || !user || !pass) {
  //     throw new Error('Configuration SMTP incomplète');
  //   }

  //   this.transporter = createTransport({
  //     host,
  //     port: Number(port),
  //     secure: true, // à mettre à false si port 587 (STARTTLS)
  //     auth: { user, pass },
  //   });

  //   this.sender = String(user);
  // }

  constructor(private configuration: ServiceConfiguration) {
    this.transporter = createTransport({
      host: this.configuration.getShared('SMTP_HOST', 'localhost'),
      port: this.configuration.getSharedNumber('SMTP_PORT', 587),
    });

    this.sender =
      this.configuration.getShared('SMTP_FROM', 'noreply@nexus-gate.com') ??
      'noreply@nexus-gate.com';
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.sender,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Erreur mail:', error);
    }
  }
}
