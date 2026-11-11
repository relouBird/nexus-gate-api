import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolve } from 'node:path';
import type { ApplicationName } from './environment';
import { ServiceConfiguration } from './configuration.service';

@Global()
@Module({})
export class ConfigurationModule {
  static forRoot(applicationName: ApplicationName): DynamicModule {
    return {
      global: true,
      module: ConfigurationModule,
      imports: [
        ConfigModule.forRoot({
          envFilePath: resolve(process.cwd(), '.env.global'),
          cache: true,
        }),
      ],
      providers: [
        {
          provide: ServiceConfiguration,
          useFactory: (configService: ConfigService) =>
            new ServiceConfiguration(applicationName, configService),
          inject: [ConfigService],
        },
      ],
      exports: [ServiceConfiguration],
    };
  }
}
