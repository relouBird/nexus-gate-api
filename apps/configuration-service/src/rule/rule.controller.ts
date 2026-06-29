import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RuleService } from './rule.service';
import { CONFIGURATION_PATTERNS } from '../app.constants';
import {
  CreateRuleDto,
  FindAllRulesDto,
  UpdateRuleDto,
  FindOneRuleDto,
  FindGlobalRulesDto,
} from './rule.dto';

@Controller()
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @MessagePattern(CONFIGURATION_PATTERNS.RULE_CREATE)
  create(@Payload() dto: CreateRuleDto) {
    return this.ruleService.create(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.RULE_FIND_ALL)
  findAll(@Payload() dto: FindAllRulesDto) {
    return this.ruleService.findAll(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.RULE_FIND_GLOBAL)
  findGlobal(@Payload() dto: FindGlobalRulesDto) {
    return this.ruleService.findGlobal(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.RULE_UPDATE)
  update(@Payload() dto: UpdateRuleDto) {
    return this.ruleService.update(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.RULE_REMOVE)
  remove(@Payload() dto: FindOneRuleDto) {
    return this.ruleService.remove(dto);
  }
}
