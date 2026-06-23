// mail/services/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { MailService } from '../mail.service';
import {
  PasswordChangedEmail,
  AccountCreatedEmail,
  AccountDeletedEmail,
} from '../templates/index';
import type { UserRole } from '../../generated/prisma-client';

// ─── Payloads ─────────────────────────────────────────────────

type PasswordChangedPayload = {
  userName?: string;
  changedAt?: string;
  logoUrl?: string;
};

/** USERS_CREATE — compte créé par le CREATOR avec mot de passe temporaire */
type AccountCreatedPayload = {
  userName: string;
  teamName: string;
  role: Extract<UserRole, 'ADMIN' | 'CLIENT'>;
  createdBy: string;
  temporaryPassword: string;
  loginUrl: string;
  logoUrl?: string;
};

/** USERS_DELETE — compte supprimé par le CREATOR */
type AccountDeletedPayload = {
  userName: string;
  teamName: string;
  deletedBy: string;
  deletedAt: string;
  logoUrl?: string;
};

// ─── Union discriminée ────────────────────────────────────────

export type NotificationContext =
  | { type: 'PASSWORD_CHANGED'; email: string; payload: PasswordChangedPayload }
  | { type: 'ACCOUNT_CREATED'; email: string; payload: AccountCreatedPayload }
  | { type: 'ACCOUNT_DELETED'; email: string; payload: AccountDeletedPayload };

// ─── Service ──────────────────────────────────────────────────

@Injectable()
export class NotificationsService {
  constructor(private readonly mailService: MailService) {}

  async send(context: NotificationContext): Promise<void> {
    const { email } = context;
    const { subject, html } = this.resolve(context);
    await this.mailService.sendMail(email, subject, html);
  }

  private resolve(ctx: NotificationContext): { subject: string; html: string } {
    switch (ctx.type) {
      case 'PASSWORD_CHANGED':
        return {
          subject: 'Votre mot de passe NexusGate a été modifié',
          html: PasswordChangedEmail(
            ctx.payload.userName,
            ctx.payload.changedAt,
            ctx.payload.logoUrl,
          ),
        };

      case 'ACCOUNT_CREATED':
        return {
          subject: `Votre compte NexusGate a été créé — équipe ${ctx.payload.teamName}`,
          html: AccountCreatedEmail(
            ctx.payload.userName,
            ctx.payload.teamName,
            ctx.payload.role,
            ctx.payload.createdBy,
            ctx.payload.temporaryPassword,
            ctx.payload.loginUrl,
            ctx.payload.logoUrl,
          ),
        };

      case 'ACCOUNT_DELETED':
        return {
          subject: `Votre compte NexusGate a été supprimé`,
          html: AccountDeletedEmail(
            ctx.payload.userName,
            ctx.payload.teamName,
            ctx.payload.deletedBy,
            ctx.payload.deletedAt,
            ctx.payload.logoUrl,
          ),
        };
    }
  }
}

// ─── Exemples d'utilisation ───────────────────────────────────
//
// USERS_CREATE — après création d'un membre par le CREATOR :
//   await this.notificationsService.send({
//     type: 'ACCOUNT_CREATED',
//     email: newUser.email,
//     payload: {
//       userName:          newUser.username,
//       teamName:          team.name,
//       role:              newUser.role,           // 'ADMIN' | 'CLIENT'
//       createdBy:         creator.username,
//       temporaryPassword: generatedPassword,      // généré côté service avant hash
//       loginUrl:          `${process.env.FRONTEND_URL}/login`,
//     },
//   });
//
// USERS_DELETE — après suppression d'un membre :
//   await this.notificationsService.send({
//     type: 'ACCOUNT_DELETED',
//     email: deletedUser.email,
//     payload: {
//       userName:  deletedUser.username,
//       teamName:  team.name,
//       deletedBy: creator.username,
//       deletedAt: new Date().toLocaleString('fr-FR'),
//     },
//   });
//
// ME_CHANGE_PASSWORD — après changement de mot de passe par l'utilisateur :
//   await this.notificationsService.send({
//     type: 'PASSWORD_CHANGED',
//     email: user.email,
//     payload: {
//       userName:  user.username,
//       changedAt: new Date().toLocaleString('fr-FR'),
//     },
//   });
