import uWS from 'uWebSockets.js';

export interface WebSocketHandlers<UserData = unknown> {
  upgrade?: (
    res: uWS.HttpResponse,
    req: uWS.HttpRequest,
    context: uWS.us_socket_context_t,
  ) => void;

  open?: (ws: uWS.WebSocket<UserData>) => void;

  message?: (
    ws: uWS.WebSocket<UserData>,
    message: ArrayBuffer,
    isBinary: boolean,
  ) => void;

  drain?: (ws: uWS.WebSocket<UserData>) => void;

  close?: (
    ws: uWS.WebSocket<UserData>,
    code: number,
    message: ArrayBuffer,
  ) => void;
}

export interface WebSocketOptions<
  UserData = unknown,
> extends WebSocketHandlers<UserData> {
  compression?: number;
  maxPayloadLength?: number;
  idleTimeout?: number;
  maxBackpressure?: number;
  sendPingsAutomatically?: boolean;
}

export interface TunnelHttpRequestPayload {
  requestId: string;
  method: string;
  path: string;
  query: string;
  headers: Record<string, string>;
  body: string | null; // base64
}

export interface TunnelHttpResponsePayload {
  requestId: string;
  status: number;
  headers: Record<string, string>;
  body: string | null; // base64
}

export interface TunnelUserData {
  serverId?: string;
  authToken?: string;
  tunnelSessionId?: string;
  authenticated: boolean;
  lastPongTouchAt: number;
}


