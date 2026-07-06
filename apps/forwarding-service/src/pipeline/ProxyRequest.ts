// pipeline/ProxyRequest.ts
import type { Middleware } from '../types/middleware.type';
import { forwardHttp } from '../infrastructure/httpClient';
import { HttpError } from '../server/handleError';

// Headers que undici/HTTP gèrent eux-mêmes — ne jamais les faire suivre tels quels
const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
]);

export const proxyRequest = (): Middleware => async (ctx) => {
  const server = ctx.server!;

  if (server.type === 'LOCAL') {
    // Tunnel non implémenté à cette étape (point 9, mis de côté).
    throw new HttpError(503, 'Tunnel non disponible pour le moment');
  }

  const targetUrl =
    server.url.replace(/\/$/, '') +
    ctx.route.subPath +
    (ctx.query ? `?${ctx.query}` : '');

  const outgoingHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(ctx.headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) outgoingHeaders[key] = value;
  }
  // Priorité aux headers du Server, comme spécifié dans la doc (§3, §7)
  Object.assign(outgoingHeaders, server.headers);

  let upstream;
  try {
    upstream = await forwardHttp(
      targetUrl,
      ctx.method,
      outgoingHeaders,
      ctx.body,
    );
  } catch (err) {
    throw new HttpError(502, 'Upstream unreachable');
  }

  if (ctx.aborted) return; // le client est parti pendant qu'on attendait l'upstream

  ctx.responded = true;
  ctx.status = upstream.statusCode; // ajouté
  ctx.res.cork(() => {
    ctx.res.writeStatus(String(upstream.statusCode));
    for (const [key, value] of Object.entries(upstream.headers)) {
      if (typeof value === 'string' && !HOP_BY_HOP.has(key.toLowerCase())) {
        ctx.res.writeHeader(key, value);
      }
    }
    ctx.res.end(upstream.body);
  });
};
