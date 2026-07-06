// pipeline/Pipeline.ts
import type { RequestContext } from './server.type';

export type Middleware = (ctx: RequestContext) => Promise<void>;
