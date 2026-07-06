// server/handleError.ts
import type { RequestContext } from '../types/server.type';
import { Respond } from './ResponseParser';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function handleError(ctx: RequestContext, err: unknown): void {
  if (ctx.aborted) return; // client déjà parti, inutile de répondre

  if (err instanceof HttpError) {
    Respond(ctx, err.status, {
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  console.error('[Forwarding] Unhandled error:', err);
  Respond(ctx, 500, { error: 'Internal error' });
}
