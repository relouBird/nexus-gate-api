import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getApplicationPrefix, type ApplicationName } from './environment';

@Injectable()
export class ServiceConfiguration {
  constructor(
    private readonly applicationName: ApplicationName,
    private readonly configService: ConfigService,
  ) {}

  get(key: string, defaultValue?: string): string | undefined {
    return (
      this.configService.get<string>(
        `${getApplicationPrefix(this.applicationName)}_${key}`,
      ) ?? defaultValue
    );
  }

  getOrThrow(key: string): string {
    const value = this.get(key);
    if (value === undefined || value.length === 0) {
      throw new Error(
        `Missing configuration: ${getApplicationPrefix(this.applicationName)}_${key}`,
      );
    }
    return value;
  }

  getNumber(key: string, defaultValue?: number): number {
    const value = this.get(key);
    if (value === undefined || value.length === 0) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(
        `Missing configuration: ${getApplicationPrefix(this.applicationName)}_${key}`,
      );
    }

    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue)) {
      throw new Error(
        `Configuration ${getApplicationPrefix(this.applicationName)}_${key} must be an integer`,
      );
    }
    return parsedValue;
  }

  getShared(key: string, defaultValue?: string): string | undefined {
    return this.configService.get<string>(`SHARED_${key}`) ?? defaultValue;
  }

  getSharedOrThrow(key: string): string {
    const value = this.getShared(key);
    if (value === undefined || value.length === 0) {
      throw new Error(`Missing shared configuration: SHARED_${key}`);
    }
    return value;
  }

  getSharedNumber(key: string, defaultValue?: number): number {
    const value = this.getShared(key);
    if (value === undefined || value.length === 0) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Missing shared configuration: SHARED_${key}`);
    }

    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue)) {
      throw new Error(`Shared configuration SHARED_${key} must be an integer`);
    }
    return parsedValue;
  }
}
