// mail/templates/index.ts
// Templates calés sur les RPC patterns NexusGate :
//   POST   /auth/team/register          → WelcomeTeamEmail
//   POST   /auth/otp/send               → OTPEmail (login + reset)
//   DELETE /auth/gateway-tokens/:id     → TokenRevokedEmail
//   TunnelSession isActive              → TunnelConnectedEmail / TunnelDisconnectedEmail
//   USERS_CREATE (RPC)                  → AccountCreatedEmail   ← NOUVEAU
//   USERS_DELETE (RPC)                  → AccountDeletedEmail   ← NOUVEAU
//   ME_CHANGE_PASSWORD (RPC)            → PasswordChangedEmail  ← NOUVEAU
//   POST   /auth/users (invite)         → MemberInviteEmail

import {
  EmailLayout,
  Greeting,
  Paragraph,
  Button,
  InfoBox,
  CodeBox,
  SupportSection,
  Divider,
  MetaTable,
} from './layout.template';
import { C } from './variable.template';

// ─── 1. Compte créé par le CREATOR — USERS_CREATE ─────────────
// Le CREATOR crée un compte → mot de passe temporaire généré côté backend
// L'utilisateur doit le changer à la première connexion

export function AccountCreatedEmail(
  userName: string,
  teamName: string,
  role: 'ADMIN' | 'CLIENT',
  createdBy: string,
  temporaryPassword: string,
  loginUrl: string,
  logoUrl?: string,
): string {
  const roleLabel = role === 'ADMIN' ? 'Administrateur' : 'Client';

  const content = `
    ${Greeting(userName)}
    ${Paragraph(`<strong style="color:${C.primary};">${createdBy}</strong> a créé un compte pour vous sur <strong>NexusGate</strong>, au sein de l'équipe <strong>${teamName}</strong>.`)}

    ${MetaTable([
      { label: 'Équipe', value: teamName },
      { label: 'Rôle', value: roleLabel },
      { label: 'Créé par', value: createdBy },
    ])}

    ${Paragraph('Voici votre mot de passe temporaire pour vous connecter :')}
    ${CodeBox(temporaryPassword, 'Mot de passe temporaire', 60)}

    ${InfoBox(
      '⚠️ <strong>Ce mot de passe est temporaire.</strong> Vous devrez obligatoirement le changer dès votre première connexion via votre profil. Ne le partagez avec personne.',
      'warning',
    )}

    ${Button('Me connecter', loginUrl, 'primary')}
    ${Divider()}
    ${Paragraph("Si vous n'attendiez pas ce compte ou si ce message ne vous est pas destiné, contactez notre support immédiatement.")}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Votre compte NexusGate a été créé',
    content,
    `${createdBy} vous a créé un compte sur NexusGate — équipe ${teamName}.`,
    logoUrl,
  );
}

// ─── 2. Suppression de compte — USERS_DELETE ─────────────────
// Le CREATOR supprime un membre → notification immédiate

export function AccountDeletedEmail(
  userName: string,
  teamName: string,
  deletedBy: string,
  deletedAt: string,
  logoUrl?: string,
): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph(`Votre compte NexusGate au sein de l'équipe <strong>${teamName}</strong> a été <strong style="color:${C.error};">supprimé</strong>.`)}

    ${MetaTable([
      { label: 'Équipe', value: teamName },
      { label: 'Supprimé par', value: deletedBy },
      { label: 'Date', value: deletedAt },
    ])}

    ${InfoBox(
      'Votre accès à la plateforme NexusGate et à toutes les ressources de cette équipe a été révoqué immédiatement.',
      'error',
    )}
    ${Divider()}
    ${InfoBox(
      "Si vous pensez que cette suppression est une erreur, contactez directement l'administrateur de l'équipe ou notre support.",
      'warning',
    )}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Votre compte a été supprimé',
    content,
    `Votre compte NexusGate (équipe ${teamName}) a été supprimé.`,
    logoUrl,
  );
}

// ─── 3. Changement de mot de passe — ME_CHANGE_PASSWORD ──────
// L'utilisateur change son propre mot de passe via son profil

export function PasswordChangedEmail(
  userName?: string,
  changedAt?: string,
  logoUrl?: string,
): string {
  const date =
    changedAt ??
    new Date().toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const content = `
    ${Greeting(userName)}
    ${Paragraph(`Votre mot de passe NexusGate a été <strong style="color:${C.success};">modifié avec succès</strong>.`)}

    ${MetaTable([
      { label: 'Date', value: date },
      { label: 'Plateforme', value: 'nexusgate.io' },
    ])}

    ${InfoBox('Votre compte est sécurisé avec votre nouveau mot de passe.', 'success')}
    ${Divider()}
    ${InfoBox(
      "<strong>Vous n'êtes pas à l'origine de ce changement ?</strong><br/>Contactez immédiatement notre support — votre compte pourrait être compromis.",
      'warning',
    )}
    ${Button('Contacter le support', 'mailto:support@nexusgate.io', 'warning')}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Mot de passe modifié',
    content,
    'Votre mot de passe NexusGate a été modifié.',
    logoUrl,
  );
}

// ─── 3. Changement de mot de passe — ME_CHANGE_PASSWORD ──────
// L'utilisateur change son propre mot de passe via son profil

export function PasswordRecreatedByAdminEmail(
  temporaryPassword: string,
  userName?: string,
  changedAt?: string,
  logoUrl?: string,
): string {
  const date =
    changedAt ??
    new Date().toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const content = `
    ${Greeting(userName)}
    ${Paragraph(`Votre mot de passe NexusGate a été <strong style="color:${C.success};">modifié avec succès</strong>.`)}

    ${MetaTable([
      { label: 'Date', value: date },
      { label: 'Plateforme', value: 'nexusgate.io' },
    ])}

    ${InfoBox('Votre compte est sécurisé avec un nouveau mot de passe.', 'success')}

    ${Paragraph('Voici votre mot de passe temporaire pour vous connecter :')}
    ${CodeBox(temporaryPassword, 'Mot de passe temporaire', 60)}
    
    ${Divider()}
    ${InfoBox(
      "<strong>Vous n'êtes pas à l'origine de ce changement ?</strong><br/>Contactez immédiatement notre support — votre compte pourrait être compromis.",
      'warning',
    )}
    ${Button('Contacter le support', 'mailto:support@nexusgate.io', 'warning')}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Mot de passe modifié',
    content,
    'Votre mot de passe NexusGate a été modifié.',
    logoUrl,
  );
}
