// mail/templates/layout.template.ts
import { C, FONT, SPACING, RADIUS } from './variable.template';

// ─── Layout principal ─────────────────────────────────────────

export function EmailLayout(
  title: string,
  content: string,
  preheader = '',
  logoUrl?: string,
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:${FONT};-webkit-font-smoothing:antialiased;">

  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};padding:${SPACING.xl} ${SPACING.md};">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header gradient NexusGate -->
          <tr>
            <td style="
              background:linear-gradient(135deg, ${C.gradientStart} 0%, ${C.gradientEnd} 100%);
              border-radius:${RADIUS.lg} ${RADIUS.lg} 0 0;
              padding:${SPACING.xl} ${SPACING.lg};
              text-align:center;
            ">
              <!-- Logo / icône -->
              <div style="
                width:56px;height:56px;
                margin:0 auto ${SPACING.md};
                background:rgba(255,255,255,0.15);
                border-radius:${RADIUS.md};
                display:inline-flex;
                align-items:center;
                justify-content:center;
              ">
                ${logoUrl
                  ? `<img src="${logoUrl}" alt="NexusGate" style="width:36px;height:36px;object-fit:contain;" />`
                  : `<span style="font-size:24px;font-weight:800;color:#fff;font-family:'Courier New',monospace;letter-spacing:-1px;">N</span>`
                }
              </div>

              <h1 style="
                font-family:${FONT};font-size:22px;font-weight:700;
                color:${C.white};margin:0 0 6px;letter-spacing:-0.3px;
              ">${title}</h1>
              <p style="font-family:${FONT};font-size:13px;color:${C.white};opacity:0.75;margin:0;letter-spacing:0.5px;">
                NexusGate — API Gateway Platform
              </p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="
              background:${C.white};
              border-radius:0 0 ${RADIUS.lg} ${RADIUS.lg};
              padding:${SPACING.xl} ${SPACING.lg};
              box-shadow:0 4px 24px rgba(0,0,0,0.08);
            ">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:${SPACING.lg} 0 0;text-align:center;">
              <p style="margin:0 0 ${SPACING.xs};font-family:${FONT};font-size:12px;color:${C.tertiary};line-height:1.6;">
                <strong style="color:${C.secondary};">NexusGate</strong> — Plateforme multi-tenant d'API Gateway<br/>
                © ${new Date().getFullYear()} NexusGate. Tous droits réservés.
              </p>
              <p style="margin:${SPACING.sm} 0 0;font-family:${FONT};font-size:11px;color:${C.tertiary};">
                <a href="#" style="color:${C.primary};text-decoration:none;margin:0 ${SPACING.xs};">Politique de confidentialité</a>
                <span style="color:${C.border};">|</span>
                <a href="#" style="color:${C.primary};text-decoration:none;margin:0 ${SPACING.xs};">Conditions d'utilisation</a>
                <span style="color:${C.border};">|</span>
                <a href="#" style="color:${C.primary};text-decoration:none;margin:0 ${SPACING.xs};">Se désabonner</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Composants atomiques ─────────────────────────────────────

export function Divider(margin = SPACING.lg): string {
  return `<div style="height:1px;background:${C.border};margin:${margin} 0;"></div>`;
}

export function Greeting(name?: string): string {
  const text = name
    ? `Bonjour <strong style="color:${C.primary};">${name}</strong>,`
    : 'Bonjour,';
  return `<p style="font-family:${FONT};font-size:18px;color:${C.title};font-weight:500;margin:0 0 ${SPACING.md};">${text}</p>`;
}

export function Paragraph(text: string): string {
  return `<p style="font-family:${FONT};font-size:16px;color:${C.text};line-height:1.6;margin:0 0 ${SPACING.md};">${text}</p>`;
}

export function Button(
  label: string,
  url: string,
  variant: 'primary' | 'success' | 'warning' | 'danger' = 'primary',
): string {
  const bg = {
    primary: C.primary,
    success: C.success,
    warning: C.warning,
    danger:  C.error,
  }[variant];

  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:${SPACING.lg} 0;">
    <tr>
      <td style="background:${bg};border-radius:${RADIUS.md};">
        <a href="${url}" style="
          display:inline-block;padding:13px 30px;
          font-family:${FONT};font-size:15px;font-weight:600;
          color:${C.white};text-decoration:none;
          border-radius:${RADIUS.md};
        ">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function InfoBox(
  text: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
): string {
  const cfg = {
    info:    { bg: C.infoLight,    border: C.info,    icon: 'ℹ️' },
    success: { bg: C.successLight, border: C.success, icon: '✓'  },
    warning: { bg: C.warningLight, border: C.warning, icon: '⚠️' },
    error:   { bg: C.errorLight,   border: C.error,   icon: '✗'  },
  }[type];

  return `
  <div style="
    background:${cfg.bg};border-left:4px solid ${cfg.border};
    border-radius:${RADIUS.sm};padding:${SPACING.md} ${SPACING.lg};
    margin:${SPACING.lg} 0;
  ">
    <p style="margin:0;font-family:${FONT};font-size:14px;color:${C.text};line-height:1.6;">
      <span style="font-size:16px;margin-right:8px;">${cfg.icon}</span>${text}
    </p>
  </div>`;
}

/** Code OTP avec design premium */
export function CodeBox(code: string, label = 'Code de vérification', expiresMinutes = 5): string {
  return `
  <div style="
    background:linear-gradient(135deg, #f5f3ff, #ede9fe);
    border:2px dashed ${C.border};
    border-radius:${RADIUS.lg};
    padding:${SPACING.xl};
    margin:${SPACING.lg} 0;
    text-align:center;
  ">
    <p style="
      font-family:${FONT};font-size:11px;color:${C.secondary};
      font-weight:700;text-transform:uppercase;letter-spacing:2px;
      margin:0 0 ${SPACING.sm};
    ">${label}</p>
    <div style="
      font-size:38px;font-weight:800;letter-spacing:10px;
      font-family:'Courier New',monospace;color:${C.primary};
      margin:${SPACING.md} 0;
    ">${code}</div>
    <p style="
      font-family:${FONT};font-size:13px;color:${C.error};
      font-weight:500;margin:${SPACING.md} 0 0;
    ">⏱️ Valide pendant ${expiresMinutes} minutes</p>
  </div>`;
}

/** Bloc d'info serveur (pour les notifications tunnel/token) */
export function ServerInfoBox(serverName: string, serverType: 'CLOUD' | 'LOCAL', identifier: string): string {
  const typeColor = serverType === 'CLOUD' ? C.info : C.warning;
  const typeBg    = serverType === 'CLOUD' ? C.infoLight : C.warningLight;

  return `
  <div style="
    background:${C.bg};border:1px solid ${C.border};
    border-radius:${RADIUS.md};padding:${SPACING.md} ${SPACING.lg};
    margin:${SPACING.lg} 0;
  ">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-family:${FONT};font-size:15px;font-weight:600;color:${C.title};">${serverName}</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:12px;color:${C.secondary};">${identifier}</p>
        </td>
        <td align="right">
          <span style="
            display:inline-block;padding:4px 10px;
            background:${typeBg};color:${typeColor};
            font-family:${FONT};font-size:11px;font-weight:700;
            border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;
          ">${serverType}</span>
        </td>
      </tr>
    </table>
  </div>`;
}

export function SupportSection(): string {
  return `
  <div style="
    background:${C.bg};border-radius:${RADIUS.md};
    padding:${SPACING.lg};margin:${SPACING.xl} 0 0;text-align:center;
  ">
    <p style="font-family:${FONT};font-size:15px;font-weight:600;color:${C.title};margin:0 0 ${SPACING.sm};">Besoin d'aide ?</p>
    <p style="font-family:${FONT};font-size:14px;color:${C.secondary};margin:${SPACING.xs} 0;">
      Notre équipe est disponible pour vous accompagner.
    </p>
    <p style="margin:${SPACING.xs} 0;">
      <a href="mailto:support@nexusgate.io" style="color:${C.primary};text-decoration:none;font-weight:500;">
        support@nexusgate.io
      </a>
    </p>
  </div>`;
}

/** Tableau de métadonnées clé/valeur */
export function MetaTable(rows: Array<{ label: string; value: string }>): string {
  const rowsHtml = rows.map(({ label, value }) => `
    <tr>
      <td style="
        padding:10px ${SPACING.md};font-family:${FONT};
        font-size:13px;color:${C.secondary};font-weight:600;
        border-bottom:1px solid ${C.border};white-space:nowrap;
        width:40%;
      ">${label}</td>
      <td style="
        padding:10px ${SPACING.md};font-family:'Courier New',monospace;
        font-size:13px;color:${C.title};
        border-bottom:1px solid ${C.border};
      ">${value}</td>
    </tr>`).join('');

  return `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="
    border:1px solid ${C.border};border-radius:${RADIUS.md};
    overflow:hidden;margin:${SPACING.lg} 0;
  ">
    ${rowsHtml}
  </table>`;
}