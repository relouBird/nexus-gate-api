import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ServiceConfiguration } from '@nexus/configuration';
import { createTransport, type Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService implements OnModuleDestroy {
  private readonly transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;
  private readonly sender: string;
  private readonly secure: string | undefined;

  constructor(configuration: ServiceConfiguration) {
    const port = configuration.getSharedNumber('SMTP_PORT', 587);
    if (port < 1 || port > 65535) {
      throw new Error(
        'Shared configuration SHARED_SMTP_PORT must be between 1 and 65535',
      );
    }

    this.secure = configuration
      .getShared('SMTP_SECURE', port === 465 ? 'true' : 'false')
      ?.toLowerCase();
    if (this.secure !== 'true' && this.secure !== 'false') {
      throw new Error(
        'Shared configuration SHARED_SMTP_SECURE must be true or false',
      );
    }

    const user = configuration.getShared('SMTP_USER');
    const password = configuration.getShared('SMTP_PASSWORD');
    if ((user && !password) || (!user && password)) {
      throw new Error(
        'Shared configuration SHARED_SMTP_USER and SHARED_SMTP_PASSWORD must be set together',
      );
    }

    this.transporter = createTransport({
      host: configuration.getShared('SMTP_HOST') || 'localhost',
      port,
      secure: this.secure === 'true',
      ...(user && password ? { auth: { user, pass: password } } : {}),
    });

    this.sender = user || 'noreply@nexus-gate.com';
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from:
        this.secure === 'true' ? `"NexusGate, Support" <${this.sender}>` : this.sender,
      to,
      subject,
      html,
    });
  }

  onModuleDestroy(): void {
    this.transporter.close();
  }
}
