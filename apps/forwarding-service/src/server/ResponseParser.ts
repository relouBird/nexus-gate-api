// server/respond.ts
import type { RequestContext } from '../types/server.type';

export function Respond(
  ctx: RequestContext,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): void {
  if (ctx.aborted || ctx.responded) return;
  ctx.responded = true;
  ctx.status = status;

  const payload = typeof body === 'string' ? body : JSON.stringify(body);

  ctx.res.cork(() => {
    ctx.res.writeStatus(String(status));
    for (const [key, value] of Object.entries(headers)) {
      ctx.res.writeHeader(key, value);
    }
    ctx.res.writeHeader(
      'Content-Type',
      headers['Content-Type'] ?? 'application/json',
    );
    ctx.res.end(payload);
  });
}
