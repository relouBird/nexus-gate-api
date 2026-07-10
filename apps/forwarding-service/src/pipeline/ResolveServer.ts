// pipeline/ResolveServer.ts
import type { Middleware } from '../types/middleware.type';
import type { ServerRepository } from '../repository/server.repository';
import { HttpError } from '../server/handleError';

export const resolveServer =
  (repo: ServerRepository): Middleware =>
  async (ctx) => {
    const { serverIdentifier } = ctx.route;
    const server = await repo.resolve(serverIdentifier);
    if (!server) throw new HttpError(404, 'Server not found');
    ctx.server = server;
  };
