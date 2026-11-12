import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function getEnvironmentFilePath(): string {
  const environment = (
    process.env.APP_ENV ??
    process.env.NODE_ENV ??
    'development'
  ).toLowerCase();
  const candidates =
    environment === 'production' || environment === 'prod'
      ? [
          '.env.global.production',
          '.env.global.prod',
          '.env.prod',
          '.env.production',
        ]
      : environment === 'test'
        ? ['.env.global.test', '.env.test']
        : ['.env.global', '.env'];
  const envFile = candidates.find((candidate) =>
    existsSync(resolve(process.cwd(), candidate)),
  );

  return resolve(process.cwd(), envFile ?? candidates[0]);
}
