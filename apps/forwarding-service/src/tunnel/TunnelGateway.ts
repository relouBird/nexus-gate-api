import type { TunnelManager } from './TunnelManager';
import type { TunnelUserData, WebSocketOptions } from '../types/socket.type';
import { PrismaService } from '../infrastructure/prisma.service';

const PONG_TOUCH_THROTTLE_MS = 20_000;

export function createTunnelGateway(
  tunnelManager: TunnelManager,
  db: PrismaService,
): WebSocketOptions<TunnelUserData> {
  return {
    idleTimeout: 30,
    maxPayloadLength: 4 * 1024 * 1024,
    sendPingsAutomatically: true,

    // Synchrone — `req` est invalide dès le premier await, même règle
    // que RequestParser côté HTTP.
    upgrade: (res, req, context) => {
      const serverId = req.getHeader('x-server-id');
      const authHeader = req.getHeader('authorization');
      const authToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      res.upgrade<TunnelUserData>(
        {
          serverId: serverId || undefined,
          authToken: authToken || undefined,
          authenticated: false,
          lastPongTouchAt: 0,
        },
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        context,
      );
    },

    open: async (ws) => {
      const userData = ws.getUserData();
      const { serverId, authToken } = userData;

      if (!serverId || !authToken) {
        try {
          ws.end(4001, 'Missing credentials');
        } catch {
          /* rien */
        }
        return;
      }

      try {
        const server = await db.server.findUnique({ where: { id: serverId } });
        if (!server || server.type !== 'LOCAL') {
          try {
            ws.end(4004, 'Server introuvable ou non LOCAL');
          } catch {
            /* rien */
          }
          return;
        }

        const session = await db.tunnelSession.upsert({
          where: { serverId },
          update: {
            isActive: true,
            connectedAt: new Date(),
            lastPingAt: new Date(),
          },
          create: { serverId },
        });

        userData.tunnelSessionId = session.id;
        userData.authenticated = true;
        tunnelManager.register(session.id, serverId, ws);

        console.log(
          `[Tunnel] Desktop connecté — server=${serverId} session=${session.id}`,
        );

        try {
          ws.send(
            JSON.stringify({
              event: 'connected',
              data: { tunnelSessionId: session.id },
            }),
          );
        } catch {
          /* socket déjà partie, pas bloquant */
        }
      } catch (err) {
        console.error(
          '[Tunnel] Échec upsert TunnelSession:',
          (err as Error).message,
        );
        try {
          ws.end(1011, 'Internal error');
        } catch {
          /* rien */
        }
      }
    },

    message: (ws, message) => {
      const userData = ws.getUserData();
      if (!userData.authenticated) return;

      let envelope: { event: string; data: any };
      try {
        envelope = JSON.parse(Buffer.from(message).toString('utf-8'));
      } catch {
        return; // message malformé — ignoré silencieusement
      }

      switch (envelope.event) {
        case 'response':
          tunnelManager.resolveResponse(envelope.data.requestId, envelope.data);
          break;

        case 'heartbeat': {
          const now = Date.now();
          if (now - userData.lastPongTouchAt < PONG_TOUCH_THROTTLE_MS) return;
          userData.lastPongTouchAt = now;
          if (userData.tunnelSessionId) {
            db.tunnelSession
              .update({
                where: { id: userData.tunnelSessionId },
                data: { lastPingAt: new Date() },
              })
              .catch(() => {});
          }
          break;
        }

        default:
          break;
      }
    },

    close: (ws) => {
      const { tunnelSessionId, serverId } = ws.getUserData();
      if (!tunnelSessionId || !serverId) return;

      tunnelManager.unregister(tunnelSessionId, serverId);

      db.tunnelSession
        .update({
          where: { id: tunnelSessionId },
          data: { isActive: false, lastPingAt: new Date() },
        })
        .catch(() => {});

      console.log(
        `[Tunnel] Desktop déconnecté — server=${serverId} session=${tunnelSessionId}`,
      );
    },
  };
}
