// infrastructure/LogQueue.ts
import { RequestLog } from '@nexus/database/prisma-client';
import type { PrismaService } from '../infrastructure/prisma.service';

interface LogEntry extends Omit<RequestLog, 'id'> {
  id?: undefined;
}

export class LogQueue {
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout;

  constructor(
    private db: PrismaService,
    private batchSize = 100,
    private flushIntervalMs = 2000,
  ) {
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  push(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length >= this.batchSize) this.flush();
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];

    try {
      console.log(`[LogQueue] Flushing ${batch.length} entries....`);
      await this.db.requestLog.createMany({ data: batch });
    } catch (err) {
      console.error(
        '[LogQueue] flush failed, dropping batch:',
        (err as Error).message,
      );
    }
  }

  async shutdown(): Promise<void> {
    clearInterval(this.flushTimer);
    await this.flush();
  }
}
