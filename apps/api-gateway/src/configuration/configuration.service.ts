// configuration.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { CONFIGURATION_PATTERNS, MICROSERVICES_CLIENTS } from '../app.constant';

import { DispatchInteface, sendToAuthService } from '../app.helper';

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.CONFIGURATION_SERVICE)
    private readonly authServiceClient: ClientProxy,
  ) {}

  // ============================================================
  // SERVERS
  // ============================================================

  createServer(dto: any, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_CREATE,
      payload: dto,
      requester,
    });
  }

  getServers(requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_FIND_ALL,
      requester,
    });
  }

  getServer(id: string, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_FIND_ONE,
      payload: { id },
      requester,
    });
  }

  updateServer(id: string, dto: any, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_UPDATE,
      payload: {
        id,
        ...dto,
      },
      requester,
    });
  }

  deleteServer(id: string, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_REMOVE,
      payload: { id },
      requester,
    });
  }

  updateTokenRequirement(id: string, dto: any, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_TOKEN_AUTH,
      payload: {
        id,
        ...dto,
      },
      requester,
    });
  }

  revokeServer(id: string, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_REVOKE,
      payload: { id },
      requester,
    });
  }

  grantServer(id: string, dto: any, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.SERVER_GRANT,
      payload: {
        id,
        ...dto,
      },
      requester,
    });
  }

  // ============================================================
  // RULES
  // ============================================================

  createRule(serverId: string, dto: any, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.RULE_CREATE,
      payload: {
        serverId,
        ...dto,
      },
      requester,
    });
  }

  getRules(serverId: string, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.RULE_FIND_ALL,
      payload: {
        serverId,
      },
      requester,
    });
  }

  getAllRules(requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.RULE_FIND_GLOBAL,
      payload: {},
      requester,
    });
  }

  updateRule(id: string, dto: any, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.RULE_UPDATE,
      payload: {
        id,
        ...dto,
      },
      requester,
    });
  }

  deleteRule(id: string, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.RULE_REMOVE,
      payload: { id },
      requester,
    });
  }

  // ============================================================
  // GATEWAY TOKENS
  // ============================================================

  createGatewayToken(dto: any, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.GATEWAY_TOKEN_CREATE,
      payload: dto,
      requester,
    });
  }

  getGatewayTokens(requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.GATEWAY_TOKEN_FIND_ALL,
      requester,
    });
  }

  revokeGatewayToken(id: string, requester: any) {
    return this.dispatch({
      pattern: CONFIGURATION_PATTERNS.GATEWAY_TOKEN_REMOVE,
      payload: { id },
      requester,
    });
  }

  // ============================================================
  // DISPATCH COMMUN
  // ============================================================

  private async dispatch(interfacePayload: DispatchInteface) {
    let payload = {};
    const pattern = interfacePayload.pattern;

    if (interfacePayload.payload) {
      payload = {
        ...payload,
        ...interfacePayload.payload,
      };
    }

    if (interfacePayload.requester) {
      const { iat, exp, ...requester } = interfacePayload.requester;

      payload = {
        ...payload,
        requester,
      };
    }

    return sendToAuthService(
      this.authServiceClient,
      pattern,
      payload,
      this.logger,
    );
  }
}
