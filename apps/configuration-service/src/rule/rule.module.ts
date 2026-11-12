import { Module } from '@nestjs/common';
import { RuleService } from './rule.service';
import { DatabaseModule } from '@nexus/database';
import { RuleController } from './rule.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [RuleController],
  providers: [RuleService],
  exports: [RuleService],
})
export class RuleModule {}
