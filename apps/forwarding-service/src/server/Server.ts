import uWS from 'uWebSockets.js';
import { UWSHttpRequest, UWSHttpResponse } from '../types/server.type';
import { WebSocketOptions } from '../types/socket.type';

export type RouteHandler = (res: UWSHttpResponse, req: UWSHttpRequest) => void;

export default class Server {
  readonly port: number = 9006;
  protected app: uWS.TemplatedApp;

  constructor(port?: number) {
    this.port = port ?? this.port;
    this.app = uWS.App();
  }

  start() {
    this.app.listen(this.port, (token) => {
      if (!token) {
        console.error(`Failed to listen on port ${this.port}`);
        return;
      }

      console.log(`Listening on http://localhost:${this.port}`);
    });
  }

  get(path: string, handler: RouteHandler) {
    this.app.get(path, handler);
    return this;
  }

  post(path: string, handler: RouteHandler) {
    this.app.post(path, handler);
    return this;
  }

  put(path: string, handler: RouteHandler) {
    this.app.put(path, handler);
    return this;
  }

  patch(path: string, handler: RouteHandler) {
    this.app.patch(path, handler);
    return this;
  }

  delete(path: string, handler: RouteHandler) {
    this.app.del(path, handler);
    return this;
  }

  options(path: string, handler: RouteHandler) {
    this.app.options(path, handler);
    return this;
  }

  any(path: string, handler: RouteHandler) {
    this.app.any(path, handler);
    return this;
  }

  // Tout ce qui concerne le webSocket
  ws<UserData = unknown>(path: string, options: WebSocketOptions<UserData>) {
    this.app.ws<UserData>(path, {
      compression: options.compression ?? uWS.SHARED_COMPRESSOR,
      maxPayloadLength: options.maxPayloadLength ?? 16 * 1024 * 1024,
      idleTimeout: options.idleTimeout ?? 60,
      maxBackpressure: options.maxBackpressure ?? 1024 * 1024,
      sendPingsAutomatically: options.sendPingsAutomatically ?? true,

      upgrade: options.upgrade,
      open: options.open,
      message: options.message,
      drain: options.drain,
      close: options.close,
    });
    return this;
  }
}
