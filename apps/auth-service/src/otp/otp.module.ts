import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nexus/database';
import { OtpService } from './otp.service';


@Module({
  imports: [DatabaseModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
