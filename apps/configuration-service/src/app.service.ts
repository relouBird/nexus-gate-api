import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // Test de communication avec le microservice
  getHello(): string {
    this.logger.log('Message received on CONFIGURATION-SERVICE : Hello World');

    return '🚀 CONFIGURATION SERVICE API is running successfully.';
  }
}
