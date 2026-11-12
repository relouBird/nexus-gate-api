import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '@nexus/database';
import { RedisCacheService as RedisService } from '@nexus/redis-cache';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  // Test de communication avec le microservice
  getHello(): string {
    this.logger.log('Message received on CONFIGURATION-SERVICE : Hello World');

    return '🚀 CONFIGURATION SERVICE API is running successfully.';
  }
}
