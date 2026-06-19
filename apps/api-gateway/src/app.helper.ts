import {
  ServiceUnavailableException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface DispatchInteface {
  pattern: string;
  payload?: any;
  requester?: any;
}

/**
 * Conversion des erreurs RPC en erreurs HTTP.
 */
export function handleServiceError(error: any, logger: Logger): never {
  // Service inaccessible
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ECONNRESET') {
    logger.error('Auth service is unreachable');

    throw new ServiceUnavailableException(
      "Le service d'authentification est indisponible",
    );
  }

  // Erreur RPC renvoyée par le microservice
  const rpcError = error?.error ?? error;

  switch (rpcError?.statusCode) {
    case 400:
      throw new BadRequestException(rpcError.message);

    case 401:
      throw new UnauthorizedException(rpcError.message);

    case 404:
      throw new NotFoundException(rpcError.message);

    case 409:
      throw new ConflictException(rpcError.message);

    default:
      logger.error(`Unexpected RPC error: ${JSON.stringify(rpcError)}`);

      throw new InternalServerErrorException(
        rpcError?.message || 'Une erreur interne est survenue',
      );
  }
}
/**
 * Envoi générique d'une requête au microservice d'authentification.
 */

export async function sendToAuthService(
  serviceClient: ClientProxy,
  pattern: string,
  payload: any,
  logger: Logger,
): Promise<any> {
  try {
    return await firstValueFrom(serviceClient.send(pattern, payload));
  } catch (error: any) {
    logger.error(
      `[Gateway] RPC call "${pattern}" failed: ${error.message}`,
      error.stack,
    );

    handleServiceError(error, logger);
  }
}
