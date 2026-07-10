// pipeline/Pipeline.ts — version finale
import { handleError } from '../server/handleError';
import { Middleware } from '../types/middleware.type';
import { RequestContext } from '../types/server.type';

export class Pipeline {
  private middlewares: Middleware[] = [];
  private finalizers: Middleware[] = [];

  use(mw: Middleware): this {
    this.middlewares.push(mw);
    return this;
  }

  finally(mw: Middleware): this {
    this.finalizers.push(mw);
    return this;
  }

  async execute(ctx: RequestContext): Promise<void> {
    try {
      for (const mw of this.middlewares) {
        if (ctx.aborted || ctx.responded) break;
        await mw(ctx);
      }
    } catch (err) {
      handleError(ctx, err); // fixe ctx.status avant les finalizers
    } finally {
      if (!ctx.aborted) {
        for (const fn of this.finalizers) await fn(ctx);
      }
    }
  }
}