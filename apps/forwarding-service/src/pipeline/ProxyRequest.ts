// pipeline/ProxyRequest.ts
import type { Middleware } from '../types/middleware.type';
import { forwardHttp } from '../infrastructure/httpClient';
import {
  HttpError,
  TunnelTimeoutError,
  TunnelUnavailableError,
} from '../server/handleError';
import { TunnelManager } from '../tunnel/TunnelManager';

export const proxyRequest =
  (tunnelManager: TunnelManager): Middleware =>
  async (ctx) => {
    const server = ctx.server!;

    //  ETAPE 1
    // 1. On filtre d'abord les headers qui iront sur le serveur forward
    const outgoingHeaders: Record<string, string> = setHeaderOnMap(ctx.headers);

    // Priorité aux headers du Server, comme spécifié dans la doc (§3, §7)
    Object.assign(outgoingHeaders, server.headers);

    // ETAPE 2
    // ACTION SI LE SERVEUR EST LOCAL

    if (server.type === 'LOCAL') {
      // Vérification purement en mémoire — pas de lecture Redis/DB ici.
      // Si le desktop n'est pas connecté, on ne tente même pas le forward.
      if (!tunnelManager.isConnected(server.id)) {
        throw new HttpError(503, 'Desktop non connecté au tunnel');
      }

      let response;

      try {
        response = await tunnelManager.forward(server.id, {
          method: ctx.method,
          path: ctx.route.subPath,
          query: ctx.query,
          headers: outgoingHeaders,
          body:
            ctx.body && ctx.body.length > 0
              ? ctx.body.toString('base64')
              : null,
        });
      } catch (err) {
        if (err instanceof TunnelTimeoutError) {
          throw new HttpError(504, "Le desktop n'a pas répondu à temps");
        }
        if (err instanceof TunnelUnavailableError)
          throw new HttpError(503, 'Desktop non connecté au tunnel');
        throw err;
      }
      if (ctx.aborted) return; // client parti pendant l'attente du desktop

      ctx.responded = true;
      ctx.status = response.status;
      ctx.res.cork(() => {
        ctx.res.writeStatus(String(response.status));
        const resHeaders = setHeaderOnMap(response.headers);
        for (const [key, value] of Object.entries(resHeaders)) {
          ctx.res.writeHeader(key, value);
        }
        ctx.res.end(
          response.body ? Buffer.from(response.body, 'base64') : undefined,
        );
      });
      return;
    }

    const targetUrl =
      server.url.replace(/\/$/, '') +
      ctx.route.subPath +
      (ctx.query ? `?${ctx.query}` : '');

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
      const upstreamHeaders = setHeaderOnMap(upstream.headers);
      for (const [key, value] of Object.entries(upstreamHeaders)) {
        ctx.res.writeHeader(key, value);
      }
      ctx.res.end(upstream.body);
    });
  };
