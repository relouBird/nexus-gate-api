import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MailModule } from '../mail.module';

@Global() // disponible partout sans ré-import, comme PrismaService
@Module({
  imports: [MailModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
