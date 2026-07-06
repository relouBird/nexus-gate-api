import dotenv from 'dotenv';

// Les infrastructures
import { RedisService } from './infrastructure/redis.service';
import { PrismaService } from './infrastructure/prisma.service';

// Les Repository
import { GatewayTokenRepository } from './repository/gateway-token.repository';
import { ServerRepository } from './repository/server.repository';

// Les Pipelines
import { Pipeline } from './pipeline/Pipeline';
import { authenticate } from './pipeline/Authenticate';
import { evaluateRules } from './pipeline/EvaluateRule';
import { logRequest } from './pipeline/Logger';
import { proxyRequest } from './pipeline/ProxyRequest';
import { resolveServer } from './pipeline/ResolveServer';

// Logging
import { LogQueue } from './types/logger.type';

// Server
import Server from './server/Server';
import { handleError } from './server/handleError';
import { buildContext } from './server/RequestParser';
import { readBody } from './server/BodyParser';

dotenv.config();

export async function bootstrap(server: Server) {
  const redis = new RedisService();
  const db = new PrismaService();

  await Promise.all([redis.connect(), db.connect()]);

  // Affiche les modèles Prisma pour vérifier que la connexion est OK et que le schéma est chargé
  console.log(
    Object.keys(
      (
        db as unknown as {
          _runtimeDataModel: { models: Record<string, unknown> };
        }
      )._runtimeDataModel.models,
    ),
  );

  const serverRepo = new ServerRepository(redis, db);
  const gatewayTokenRepo = new GatewayTokenRepository(redis);
  const logQueue = new LogQueue(db);

  const pipeline = new Pipeline()
    .use(resolveServer(serverRepo))
    .use(authenticate(gatewayTokenRepo))
    .use(evaluateRules(redis))
    .use(proxyRequest())
    .finally(logRequest(logQueue));

  // le Server et le Pipeline recevront redis/db par injection manuelle
  // (pas de DI framework côté Forwarding, cohérent avec "Fastify pur / pas de NestJS")

  server.any('/*', (res, req) => {
    // 1. Tout ce qui touche à `req` est fait ICI, synchrone, avant tout await
    const ctx = buildContext(res, req);
    res.onAborted(() => {
      ctx.aborted = true;
    });

    // 2. Un seul point d'abort, centralisé
    const needsBody = ['POST', 'PUT', 'PATCH'].includes(ctx.method);

    // 3. On lit le body seulement si la méthode le justifie (évite d'attendre pour un GET)
    const run = async () => {
      if (needsBody) ctx.body = await readBody(res);
      if (ctx.aborted) return;
      await pipeline.execute(ctx);
    };

    run().catch((err) => {
      if (ctx.aborted) return;
      handleError(ctx, err);
    });
  });

  // Ceci est pour le test de connexion avec n'importe quel Client...
  server.any('/listen/*', (res, req) => {
    console.log('');
    console.log('Method :', req.getMethod());
    console.log('Url    :', req.getUrl());
    console.log('Query  :', req.getQuery());

    req.forEach((key, value) => {
      console.log(`${key}: ${value}`);
    });

    res.cork(() => {
      res.writeStatus('200 OK');
      res.writeHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          method: req.getMethod(),
          url: req.getUrl(),
          query: req.getQuery(),
        }),
      );
    });
  });

  process.on('SIGTERM', async () => {
    await logQueue.shutdown();
    await redis.disconnect();
    await db.disconnect();
    process.exit(0);
  });
}
