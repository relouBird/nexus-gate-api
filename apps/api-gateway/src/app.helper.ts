import {
  ServiceUnavailableException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
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
    logger.error('Dedicated service is unreachable');

    throw new ServiceUnavailableException('Le service dedié est indisponible');
  }

  // Erreur RPC renvoyée par le microservice
  const rpcError = error?.error ?? error;

  switch (rpcError?.statusCode) {
    case 400:
      throw new BadRequestException(rpcError.message);

    case 401:
      throw new UnauthorizedException(rpcError.message);

    case 403:
      throw new ForbiddenException(rpcError.message);

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

/**
 * Convertir un objet en chaine de caractère
 */
export function objectToString(obj: Record<string, any>): string {
  if (typeof obj == 'object') {
    return (
      '{' +
      Object.entries(obj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') +
      '}'
    );
  }

  return 'Not a Object';
}
