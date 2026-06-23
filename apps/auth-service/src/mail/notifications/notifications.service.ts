// mail/services/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { MailService } from '../mail.service';
import {
  WelcomeTeamEmail,
  OTPEmail,
  PasswordResetConfirmationEmail,
  PasswordChangedEmail,
  TokenRevokedEmail,
  TunnelConnectedEmail,
  TunnelDisconnectedEmail,
} from '../templates/index';
import type { UserRole } from '../../generated/prisma-client';

// ─── Payloads ─────────────────────────────────────────────────

type WelcomeTeamPayload = {
  userName: string;
  teamName: string;
  teamSlug: string;
  logoUrl?: string;
};

type OTPPayload = {
  otp: string;
  purpose: 'login' | 'reset';
  userName?: string;
  logoUrl?: string;
};

type PasswordResetConfirmPayload = {
  userName?: string;
  logoUrl?: string;
};

type PasswordChangedPayload = {
  userName?: string;
  changeDate?: string;
  logoUrl?: string;
};

type MemberInvitePayload = {
  inviteeName: string;
  teamName: string;
  teamSlug: string;
  role: Extract<UserRole, 'ADMIN' | 'CLIENT'>;
  inviterName: string;
  loginUrl: string;
  logoUrl?: string;
};

type TokenRevokedPayload = {
  tokenName: string;
  revokedBy: string;
  revokedAt: string;
  userName?: string;
  logoUrl?: string;
};

type TunnelConnectedPayload = {
  serverName: string;
  serverType: 'CLOUD' | 'LOCAL';
  identifier: string;
  connectedAt: string;
  userName?: string;
  logoUrl?: string;
};

type TunnelDisconnectedPayload = {
  serverName: string;
  serverType: 'CLOUD' | 'LOCAL';
  identifier: string;
  disconnectedAt: string;
  reason: 'timeout' | 'manual' | 'error';
  userName?: string;
  logoUrl?: string;
};

// ─── Union discriminée ────────────────────────────────────────

export type NotificationContext =
  | { type: 'WELCOME_TEAM'; email: string; payload: WelcomeTeamPayload }
  | { type: 'OTP'; email: string; payload: OTPPayload }
  | {
      type: 'PASSWORD_RESET_CONFIRM';
      email: string;
      payload: PasswordResetConfirmPayload;
    }
  | { type: 'PASSWORD_CHANGED'; email: string; payload: PasswordChangedPayload }
  | { type: 'TOKEN_REVOKED'; email: string; payload: TokenRevokedPayload }
  | { type: 'TUNNEL_CONNECTED'; email: string; payload: TunnelConnectedPayload }
  | {
      type: 'TUNNEL_DISCONNECTED';
      email: string;
      payload: TunnelDisconnectedPayload;
    };

// ─── Service ──────────────────────────────────────────────────

@Injectable()
export class NotificationsService {
  constructor(private readonly mailService: MailService) {}

  async send(context: NotificationContext): Promise<void> {
    const { email } = context;
    const { subject, html } = this.resolve(context);
    await this.mailService.sendMail(email, subject, html);
  }

  // ── Résolution sujet + template ──────────────────────────────

  private resolve(ctx: NotificationContext): { subject: string; html: string } {
    switch (ctx.type) {
      case 'WELCOME_TEAM':
        return {
          subject: `Bienvenue sur NexusGate — Équipe ${ctx.payload.teamName} créée`,
          html: WelcomeTeamEmail(
            ctx.payload.userName,
            ctx.payload.teamName,
            ctx.payload.teamSlug,
            ctx.payload.logoUrl,
          ),
        };

      case 'OTP':
        return {
          subject:
            ctx.payload.purpose === 'login'
              ? 'Votre code de connexion NexusGate'
              : 'Réinitialisez votre mot de passe NexusGate',
          html: OTPEmail(
            ctx.payload.otp,
            ctx.payload.purpose,
            ctx.payload.userName,
            ctx.payload.logoUrl,
          ),
        };

      case 'PASSWORD_RESET_CONFIRM':
        return {
          subject: 'Mot de passe réinitialisé — NexusGate',
          html: PasswordResetConfirmationEmail(
            ctx.payload.userName,
            ctx.payload.logoUrl,
          ),
        };

      case 'PASSWORD_CHANGED':
        return {
          subject: 'Votre mot de passe NexusGate a été modifié',
          html: PasswordChangedEmail(
            ctx.payload.userName,
            ctx.payload.changeDate,
            ctx.payload.logoUrl,
          ),
        };
        
      case 'TOKEN_REVOKED':
        return {
          subject: `GatewayToken révoqué — NexusGate`,
          html: TokenRevokedEmail(
            ctx.payload.tokenName,
            ctx.payload.revokedBy,
            ctx.payload.revokedAt,
            ctx.payload.userName,
            ctx.payload.logoUrl,
          ),
        };

      case 'TUNNEL_CONNECTED':
        return {
          subject: `Tunnel connecté — ${ctx.payload.serverName}`,
          html: TunnelConnectedEmail(
            ctx.payload.serverName,
            ctx.payload.serverType,
            ctx.payload.identifier,
            ctx.payload.connectedAt,
            ctx.payload.userName,
            ctx.payload.logoUrl,
          ),
        };

      case 'TUNNEL_DISCONNECTED':
        return {
          subject: `Tunnel hors ligne — ${ctx.payload.serverName}`,
          html: TunnelDisconnectedEmail(
            ctx.payload.serverName,
            ctx.payload.serverType,
            ctx.payload.identifier,
            ctx.payload.disconnectedAt,
            ctx.payload.reason,
            ctx.payload.userName,
            ctx.payload.logoUrl,
          ),
        };
    }
  }
}

// ─── Exemples d'utilisation dans les autres services ──────────
//
// Auth Service — après POST /auth/team/register :
//   await this.notificationsService.send({
//     type: 'WELCOME_TEAM',
//     email: user.email,
//     payload: {
//       userName: user.username,
//       teamName: team.name,
//       teamSlug: team.slug,
//       loginUrl: `${process.env.FRONTEND_URL}/login`,
//     },
//   });
//
// Auth Service — après POST /auth/otp/send :
//   await this.notificationsService.send({
//     type: 'OTP',
//     email: user.email,
//     payload: { otp, purpose: 'login', userName: user.username },
//   });
//
// Auth Service — après DELETE /auth/gateway-tokens/:id :
//   await this.notificationsService.send({
//     type: 'TOKEN_REVOKED',
//     email: creator.email,
//     payload: {
//       tokenName: token.name,
//       revokedBy: revoker.username,
//       revokedAt: new Date().toLocaleString('fr-FR'),
//     },
//   });
//
// Forwarding Service — après WS /tunnel/connect (TunnelSession créée) :
//   await this.notificationsService.send({
//     type: 'TUNNEL_CONNECTED',
//     email: owner.email,
//     payload: {
//       serverName: server.name,
//       serverType: server.type,
//       identifier: server.identifier,
//       connectedAt: new Date().toLocaleString('fr-FR'),
//     },
//   });
//
// Forwarding Service — après TunnelSession.isActive = false :
//   await this.notificationsService.send({
//     type: 'TUNNEL_DISCONNECTED',
//     email: owner.email,
//     payload: {
//       serverName: server.name,
//       serverType: server.type,
//       identifier: server.identifier,
//       disconnectedAt: new Date().toLocaleString('fr-FR'),
//       reason: 'timeout',
//     },
//   });
