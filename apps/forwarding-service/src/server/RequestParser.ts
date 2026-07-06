// server/RequestParser.ts
import type {
  ParsedRoute,
  RequestContext,
  UWSHttpResponse,
  UWSHttpRequest,
} from '../types/server.type';

export function parseRoute(url: string): ParsedRoute {
  // url = "/users-api/v1/users/42"
  const segments = url.split('/').filter(Boolean);
  const [serverIdentifier = '', ...rest] = segments;
  return {
    serverIdentifier,
    subPath: '/' + rest.join('/'),
  };
}

export function extractHeaders(req: UWSHttpRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  req.forEach((key, value) => {
    headers[key] = value;
  });
  return headers;
}

export function extractIp(res: UWSHttpResponse): string {
  // getProxiedRemoteAddressAsText() si tu es derrière un reverse proxy/LB
  // avec forwarding activé côté uWS ; sinon getRemoteAddressAsText().
  const buf = res.getRemoteAddressAsText();
  return Buffer.from(buf).toString('utf-8');
}

/**
 * Construit le RequestContext de façon strictement synchrone.
 * Ne JAMAIS faire d'await avant l'appel à cette fonction dans le handler.
 */
export function buildContext(
  res: UWSHttpResponse,
  req: UWSHttpRequest,
): RequestContext {
  const url = req.getUrl();
  const headers = extractHeaders(req);
  // x-forwarded-for a priorité si présent (derrière un LB), sinon l'IP socket
  const forwardedFor = headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : extractIp(res);

  return {
    method: req.getMethod().toUpperCase(),
    url,
    query: req.getQuery(),
    headers,
    ip,
    route: parseRoute(url),

    body: null,
    server: undefined,
    gatewayToken: undefined,
    geo: undefined,

    startedAt: Date.now(),

    responded: false,
    aborted: false,
    status: 200,
    responseHeaders: {},
    responseBody: '',

    res,
  };
}
