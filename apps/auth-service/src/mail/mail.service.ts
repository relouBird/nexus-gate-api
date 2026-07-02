import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config';

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

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT')),
    });

    this.sender = String(this.configService.get('SMTP_HOST'));
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: 'noreply@nexus-gate.com',
        // from: `"NexusGate, Supports" <${this.sender}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Erreur mail:', error);
    }
  }
}
