import uWS from 'uWebSockets.js';

export type RouteHandler = (
  res: uWS.HttpResponse,
  req: uWS.HttpRequest,
) => void;

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
}
