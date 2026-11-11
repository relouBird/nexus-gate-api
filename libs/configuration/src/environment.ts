import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotEnv } from 'dotenv';

export const APPLICATION_NAMES = [
  'api-gateway',
  'auth-service',
  'user-service',
  'configuration-service',
  'forwarding-service',
] as const;

export type ApplicationName = (typeof APPLICATION_NAMES)[number];

export function getApplicationPrefix(applicationName: ApplicationName): string {
  return applicationName.replace(/-/g, '_').toUpperCase();
}

export function loadGlobalEnvironment(): void {
  const envFilePath = resolve(process.cwd(), '.env.global');
  if (existsSync(envFilePath)) {
    loadDotEnv({ path: envFilePath });
  }
}

export function readServiceEnvironment(
  applicationName: ApplicationName,
  key: string,
  defaultValue?: string,
): string | undefined {
  const envKey = `${getApplicationPrefix(applicationName)}_${key}`;
  const value = process.env[envKey];
  if (value === undefined || value.length === 0) {
    return defaultValue;
  }
  return value;
}

export function readServiceEnvironmentNumber(
  applicationName: ApplicationName,
  key: string,
  defaultValue?: number,
): number {
  const value = readServiceEnvironment(applicationName, key);
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(
      `Missing configuration: ${getApplicationPrefix(applicationName)}_${key}`,
    );
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue)) {
    throw new Error(
      `Configuration ${getApplicationPrefix(applicationName)}_${key} must be an integer`,
    );
  }
  return parsedValue;
}
