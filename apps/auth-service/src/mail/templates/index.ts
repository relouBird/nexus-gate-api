// mail/templates/index.ts
// Templates calés sur les endpoints doc NexusGate :
//   POST /auth/team/register   → WelcomeTeamEmail
//   POST /auth/otp/send        → OTPEmail (login + reset)
//   POST /auth/otp/verify      → (pas d'email)
//   DELETE /auth/gateway-tokens/:id → TokenRevokedEmail
//   TunnelSession isActive     → TunnelConnectedEmail / TunnelDisconnectedEmail
//   PATCH /auth/users/:id pass → PasswordChangedEmail
//   POST /auth/users           → MemberInviteEmail

import {
  EmailLayout,
  Greeting,
  Paragraph,
  Button,
  InfoBox,
  CodeBox,
  SupportSection,
  Divider,
  ServerInfoBox,
  MetaTable,
} from './layout.template';
import { C } from './variable.template';

// ─── 1. Bienvenue — création Team + compte CREATOR ────────────
// Déclenché après POST /auth/team/register

export function WelcomeTeamEmail(
  userName: string,
  teamName: string,
  teamSlug: string,
  logoUrl?: string,
): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph(`Votre équipe <strong style="color:${C.primary};">${teamName}</strong> a été créée avec succès sur NexusGate.`)}
    ${Paragraph('Votre compte <strong>CREATOR</strong> vous donne un accès complet à la plateforme : gestion des serveurs, des règles de filtrage, des tokens et des membres de votre équipe.')}

    ${MetaTable([
      { label: 'Équipe', value: teamName },
      { label: 'Slug', value: teamSlug },
      {
        label: 'URL Gateway',
        value: `nexusgate.io/${teamSlug}/{server}/{path}`,
      },
      { label: 'Rôle', value: 'CREATOR' },
    ])}

    ${InfoBox('Commencez par enregistrer votre premier serveur dans la section <strong>Réseau → Serveurs</strong>.', 'info')}
    ${SupportSection()}
  `;

  return EmailLayout(
    `Bienvenue sur NexusGate, ${userName} !`,
    content,
    `Votre équipe ${teamName} est prête — Connectez-vous maintenant.`,
    logoUrl,
  );
}

// ─── 2. OTP — connexion ou réinitialisation ───────────────────
// Déclenché après POST /auth/otp/send

export function OTPEmail(
  otp: string,
  purpose: 'login' | 'reset',
  userName?: string,
  logoUrl?: string,
): string {
  const cfg = {
    login: {
      title: 'Code de connexion',
      message:
        'Vous avez demandé un code de vérification pour accéder à votre compte NexusGate.',
      preheader: `Votre code de connexion NexusGate : ${otp}`,
    },
    reset: {
      title: 'Réinitialisation du mot de passe',
      message:
        'Vous avez demandé à réinitialiser votre mot de passe NexusGate.',
      preheader: `Code de réinitialisation NexusGate : ${otp}`,
    },
  }[purpose];

  const content = `
    ${Greeting(userName)}
    ${Paragraph(cfg.message)}
    ${Paragraph('Voici votre code à usage unique :')}
    ${CodeBox(otp, 'Code de vérification', 5)}
    ${InfoBox("Ne partagez jamais ce code. L'équipe NexusGate ne vous le demandera jamais.", 'warning')}
    ${Paragraph(`Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre compte reste sécurisé.`)}
    ${SupportSection()}
  `;

  return EmailLayout(cfg.title, content, cfg.preheader, logoUrl);
}

// ─── 3. Confirmation reset mot de passe ───────────────────────

export function PasswordResetConfirmationEmail(
  userName?: string,
  logoUrl?: string,
): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph('Votre mot de passe NexusGate a été <strong style="color:${C.success};">réinitialisé avec succès</strong>.')}
    ${InfoBox('Votre compte est maintenant sécurisé avec votre nouveau mot de passe.', 'success')}
    ${Divider()}
    ${InfoBox("Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement notre support.", 'warning')}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Mot de passe réinitialisé',
    content,
    'Votre mot de passe NexusGate a été réinitialisé.',
    logoUrl,
  );
}

// ─── 4. Mot de passe modifié ──────────────────────────────────
// Déclenché après un PATCH /auth/users/:id (future route)

export function PasswordChangedEmail(
  userName?: string,
  changeDate?: string,
  logoUrl?: string,
): string {
  const date =
    changeDate ??
    new Date().toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const content = `
    ${Greeting(userName)}
    ${Paragraph('Votre mot de passe NexusGate a été <strong style="color:${C.success};">modifié avec succès</strong>.')}
    ${MetaTable([
      { label: 'Date', value: date },
      { label: 'Plateforme', value: 'nexusgate.io' },
    ])}
    ${Divider()}
    ${InfoBox(`<strong>Vous n'êtes pas à l'origine de ce changement ?</strong><br/>Contactez immédiatement notre support — votre compte pourrait être compromis.`, 'warning')}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Mot de passe modifié',
    content,
    'Votre mot de passe NexusGate a été modifié.',
    logoUrl,
  );
}

// ─── 6. Token révoqué ─────────────────────────────────────────
// Déclenché après DELETE /auth/gateway-tokens/:id

export function TokenRevokedEmail(
  tokenName: string,
  revokedBy: string,
  revokedAt: string,
  userName?: string,
  logoUrl?: string,
): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph(`Un <strong>GatewayToken</strong> de votre équipe NexusGate a été révoqué.`)}

    ${MetaTable([
      { label: 'Token', value: tokenName },
      { label: 'Révoqué par', value: revokedBy },
      { label: 'Date', value: revokedAt },
    ])}

    ${InfoBox('Toutes les requêtes utilisant ce token sont désormais rejetées avec une erreur <strong>401 Unauthorized</strong>.', 'warning')}
    ${Paragraph("Si cette révocation est intentionnelle, aucune action n'est requise. Sinon, vérifiez l'activité de votre équipe dans le tableau de bord.")}
    ${Button('Gérer mes tokens', 'https://nexusgate.io/network/tokens', 'primary')}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Token révoqué',
    content,
    `GatewayToken "${tokenName}" révoqué sur NexusGate.`,
    logoUrl,
  );
}

// ─── 7. Tunnel connecté ───────────────────────────────────────
// Déclenché lors de la création d'une TunnelSession (WS /tunnel/connect)

export function TunnelConnectedEmail(
  serverName: string,
  serverType: 'CLOUD' | 'LOCAL',
  identifier: string,
  connectedAt: string,
  userName?: string,
  logoUrl?: string,
): string {
  const content = `
    ${Greeting(userName)}
    ${Paragraph('Un tunnel WebSocket vient d\'être <strong style="color:${C.success};">établi avec succès</strong> pour le serveur suivant :')}
    ${ServerInfoBox(serverName, serverType, identifier)}
    ${MetaTable([
      { label: 'Connecté le', value: connectedAt },
      { label: 'Statut', value: '✓ Actif' },
      { label: 'Protocole', value: 'WebSocket (ws)' },
    ])}
    ${InfoBox('Le serveur local est maintenant accessible via NexusGate. Les requêtes entrantes seront tunnelées vers votre machine.', 'success')}
    ${Button('Voir le serveur', `https://nexusgate.io/network/servers`, 'primary')}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Tunnel connecté',
    content,
    `Tunnel actif pour ${serverName}.`,
    logoUrl,
  );
}

// ─── 8. Tunnel déconnecté ────────────────────────────────────
// Déclenché quand TunnelSession.isActive passe à false

export function TunnelDisconnectedEmail(
  serverName: string,
  serverType: 'CLOUD' | 'LOCAL',
  identifier: string,
  disconnectedAt: string,
  reason: 'timeout' | 'manual' | 'error',
  userName?: string,
  logoUrl?: string,
): string {
  const reasonCfg = {
    timeout: {
      label: 'Timeout heartbeat (> 30s sans ping)',
      type: 'warning' as const,
    },
    manual: { label: 'Déconnexion manuelle', type: 'info' as const },
    error: { label: 'Erreur WebSocket', type: 'error' as const },
  }[reason];

  const content = `
    ${Greeting(userName)}
    ${Paragraph(`Le tunnel WebSocket du serveur <strong>${serverName}</strong> a été <strong style="color:${C.error};">déconnecté</strong>.`)}
    ${ServerInfoBox(serverName, serverType, identifier)}
    ${MetaTable([
      { label: 'Déconnecté le', value: disconnectedAt },
      { label: 'Raison', value: reasonCfg.label },
      { label: 'Statut', value: '✗ Inactif' },
    ])}
    ${InfoBox(
      reason === 'error'
        ? "Les requêtes vers ce serveur retournent désormais <strong>503 Tunnel offline</strong>. Relancez l'agent Desktop pour rétablir la connexion."
        : reason === 'timeout'
          ? "L'agent Desktop n'a pas répondu aux pings pendant plus de 30 secondes. Vérifiez que l'application est toujours en cours d'exécution."
          : "Le tunnel a été fermé manuellement depuis l'agent Desktop.",
      reasonCfg.type,
    )}
    ${Button('Voir le serveur', `https://nexusgate.io/network/servers`, reason === 'error' ? 'danger' : 'primary')}
    ${SupportSection()}
  `;

  return EmailLayout(
    'Tunnel déconnecté',
    content,
    `Tunnel ${serverName} hors ligne.`,
    logoUrl,
  );
}
