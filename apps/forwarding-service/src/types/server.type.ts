import uWS from 'uWebSockets.js';
import { ActionType, ServerType } from "@nexus/database/prisma-client";
import { GeoInfoIp } from './rule.type';

export type UWSHttpResponse = uWS.HttpResponse;
export type UWSHttpRequest = uWS.HttpRequest;

export interface ParsedRoute {
  serverIdentifier: string;
  subPath: string; // ex: "/v1/users/42", toujours préfixé par "/"
}

export enum RuleAction {
  DENY = 'DENY',
  ALLOW = 'ALLOW',
  CHALLENGE = 'CHALLENGE',
  LOG = 'LOG',
  REDIRECT = 'REDIRECT',
}

export interface ServerConfig {
  id: string;
  teamId: string;
  type: ServerType;
  url: string;
  requireToken: boolean;
  headers: Record<string, string>;
  rules: RuleConfig[];
}

export interface RuleConfig {
  id: string;
  type: string;
  condition: Record<string, unknown>;
  action: ActionType;
  priority: number;
}

export interface CachedGatewayToken {
  id: string;
  teamId: string;
  userId: string;
  scopeServerIds: string[];
}

export interface RequestContext {
  // ── Figé à la construction, jamais réécrit ──
  readonly method: string;
  readonly url: string;
  readonly query: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly ip: string;
  readonly route: ParsedRoute;

  // ── Rempli progressivement par le pipeline ──
  body: Buffer | null;
  server?: ServerConfig;
  gatewayToken?: CachedGatewayToken;
  geo?: GeoInfoIp;

  // Afin de connaitre à quelle moment commmence l'activité
  readonly startedAt: number;

  // ── État de réponse ──
  responded: boolean;
  aborted: boolean;
  status: number;
  responseHeaders: Record<string, string>;
  responseBody: string | Buffer;

  // ── Accès bas niveau pour le middleware qui écrit réellement la réponse ──
  readonly res: UWSHttpResponse;
}
