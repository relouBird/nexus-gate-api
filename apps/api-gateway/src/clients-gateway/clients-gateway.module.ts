import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceConfiguration } from '@nexus/configuration';

import { MICROSERVICES_CLIENTS } from '../app.constant';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: MICROSERVICES_CLIENTS.AUTH_SERVICE,
          useFactory: (config: ServiceConfiguration) => ({
            transport: Transport.TCP,
            options: {
              host: config.get('AUTH_SERVICE_HOST', 'localhost'),
              port: config.getNumber('AUTH_SERVICE_PORT', 9003),
            },
          }),
          inject: [ServiceConfiguration],
        },
        {
          name: MICROSERVICES_CLIENTS.USER_SERVICE,
          useFactory: (config: ServiceConfiguration) => ({
            transport: Transport.TCP,
            options: {
              host: config.get('USER_SERVICE_HOST', 'localhost'),
              port: config.getNumber('USER_SERVICE_PORT', 9004),
            },
          }),
          inject: [ServiceConfiguration],
        },
        {
          name: MICROSERVICES_CLIENTS.CONFIGURATION_SERVICE,
          useFactory: (config: ServiceConfiguration) => ({
            transport: Transport.TCP,
            options: {
              host: config.get('CONFIGURATION_SERVICE_HOST', 'localhost'),
              port: config.getNumber('CONFIGURATION_SERVICE_PORT', 9005),
            },
          }),
          inject: [ServiceConfiguration],
        },
      ],
    }),
  ],
  exports: [ClientsModule],
})
export class ClientsGatewayModule {}
