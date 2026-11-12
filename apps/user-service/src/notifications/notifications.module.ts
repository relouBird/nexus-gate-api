import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nexus/mailer';
import { NotificationsService } from './notifications.service';

@Global() // disponible partout sans ré-import, comme PrismaService
@Module({
  imports: [MailerModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
