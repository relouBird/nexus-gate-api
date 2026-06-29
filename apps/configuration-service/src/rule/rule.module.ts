import { Module } from '@nestjs/common';
import { RuleService } from './rule.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RuleController } from './rule.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RuleController],
  providers: [RuleService],
  exports: [RuleService],
})
export class RuleModule {}
