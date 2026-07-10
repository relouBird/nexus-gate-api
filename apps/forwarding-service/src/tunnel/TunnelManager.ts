import { randomUUID } from 'crypto';
import uWS from 'uWebSockets.js';
import {
  TunnelHttpRequestPayload,
  TunnelHttpResponsePayload,
  TunnelUserData,
} from '../types/socket.type';
import { TunnelUnavailableError, TunnelTimeoutError } from '../server/handleError';

interface PendingRequest {
  resolve: (res: TunnelHttpResponsePayload) => void;
  reject: (err: Error) => void;
  timeout: NodeJS.Timeout;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export class TunnelManager {
  private sessions = new Map<string, uWS.WebSocket<TunnelUserData>>(); // tunnelSessionId -> ws
  private serverIndex = new Map<string, string>(); // serverId -> tunnelSessionId
  private pending = new Map<string, PendingRequest>(); // requestId -> pending

  register(tunnelSessionId: string, serverId: string, ws: uWS.WebSocket<TunnelUserData>): void {
    const previousSessionId = this.serverIndex.get(serverId);
    if (previousSessionId && previousSessionId !== tunnelSessionId) {
      const previousWs = this.sessions.get(previousSessionId);
      try { previousWs?.end(4009, 'Replaced by new connection'); } catch { /* déjà fermée */ }
      this.sessions.delete(previousSessionId);
    }

    this.sessions.set(tunnelSessionId, ws);
    this.serverIndex.set(serverId, tunnelSessionId);
  }

  unregister(tunnelSessionId: string, serverId: string): void {
    if (this.sessions.get(tunnelSessionId)) {
      this.sessions.delete(tunnelSessionId);
    }
    if (this.serverIndex.get(serverId) === tunnelSessionId) {
      this.serverIndex.delete(serverId);
    }
  }

  /**
   * Seule vérification à faire depuis ProxyRequest.
   * Purement en mémoire — pas de round-trip Redis/DB.
   */
  isConnected(serverId: string): boolean {
    return this.serverIndex.has(serverId);
  }

  /**
   * Force la fermeture d'une socket suite à un timeout de forward.
   * Réutilise le handler `close` existant (DB + unregister) au lieu
   * de dupliquer la logique de nettoyage ici.
   */
  forceClose(serverId: string, code: number, reason: string): void {
    const tunnelSessionId = this.serverIndex.get(serverId);
    const ws = tunnelSessionId ? this.sessions.get(tunnelSessionId) : undefined;
    if (!ws) return;
    try { ws.end(code, reason); } catch { /* déjà fermée */ }
  }

  forward(
    serverId: string,
    req: Omit<TunnelHttpRequestPayload, 'requestId'>,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  ): Promise<TunnelHttpResponsePayload> {
    const sessionId = this.serverIndex.get(serverId);
    const ws = sessionId ? this.sessions.get(sessionId) : undefined;

    if (!ws) return Promise.reject(new TunnelUnavailableError());

    const requestId = randomUUID();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId);
        // Auto-correction : le desktop n'a pas répondu dans le délai imparti.
        // On force la fermeture de la socket — soit elle est réellement morte
        // (uWS mettra à jour l'état via `close`), soit le desktop est juste
        // très lent/surchargé et devra se reconnecter, ce qui est acceptable
        // vu qu'il n'a de toute façon pas honoré cette requête.
        this.forceClose(serverId, 1011, 'No response — connection assumed dead');
        reject(new TunnelTimeoutError());
      }, timeoutMs);

      this.pending.set(requestId, { resolve, reject, timeout });

      const envelope = JSON.stringify({
        event: 'request',
        data: { requestId, ...req },
      });

      // Backpressure : uWS bufferise en interne. Le timeout ci-dessus
      // couvre le cas d'une socket réellement morte ou trop lente.
      ws.send(envelope, false);
    });
  }

  resolveResponse(requestId: string, payload: TunnelHttpResponsePayload): void {
    const pending = this.pending.get(requestId);
    if (!pending) return; // réponse tardive (déjà timeout) ou dupliquée — ignorée
    clearTimeout(pending.timeout);
    this.pending.delete(requestId);
    pending.resolve(payload);
  }
}