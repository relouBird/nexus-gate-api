import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { ServiceConfiguration } from '@nexus/configuration';
import { MailerService } from './mailer.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
  })),
}));

describe('MailerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a shared SMTP transport and sends from the configured address', async () => {
    const configuration = new ServiceConfiguration(
      'auth-service',
      new ConfigService({
        SHARED_SMTP_HOST: 'smtp.example.com',
        SHARED_SMTP_PORT: '465',
        SHARED_SMTP_USER: 'mailer@example.com',
        SHARED_SMTP_PASSWORD: 'password',
        SHARED_SMTP_FROM: 'noreply@example.com',
      }),
    );
    const service = new MailerService(configuration);
    const transporter = jest.mocked(createTransport).mock.results[0].value;

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: {
        user: 'mailer@example.com',
        pass: 'password',
      },
    });

    await service.sendMail('user@example.com', 'Welcome', '<p>Hello</p>');

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'user@example.com',
      subject: 'Welcome',
      html: '<p>Hello</p>',
    });

    service.onModuleDestroy();
    expect(transporter.close).toHaveBeenCalled();
  });

  it('rejects partially configured SMTP credentials', () => {
    const configuration = new ServiceConfiguration(
      'auth-service',
      new ConfigService({
        SHARED_SMTP_USER: 'mailer@example.com',
      }),
    );

    expect(() => new MailerService(configuration)).toThrow(
      'SHARED_SMTP_USER and SHARED_SMTP_PASSWORD must be set together',
    );
  });
});
