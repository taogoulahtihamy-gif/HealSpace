function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildEmailVerificationEmail({
  firstName,
  verificationUrl,
  expiresInMinutes,
}) {
  const safeFirstName = escapeHtml(firstName || "utilisateur");

  const safeVerificationUrl = escapeHtml(verificationUrl);

  const safeExpiration = escapeHtml(expiresInMinutes);

  const subject = "Vérification de votre adresse email HealSpace";

  const text = [
    `Bonjour ${firstName || "utilisateur"},`,
    "",
    "Bienvenue sur HealSpace.",
    "Veuillez confirmer votre adresse email pour sécuriser votre compte.",
    `Ce lien expire dans ${expiresInMinutes} minutes :`,
    verificationUrl,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${subject}</title>
      </head>
      <body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#172033;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(23,32,51,.08);">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#6157e8;">HEALSPACE</p>

                    <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;">
                      Vérification de votre adresse email
                    </h1>

                    <p style="margin:0 0 16px;line-height:1.6;">
                      Bonjour ${safeFirstName},
                    </p>

                    <p style="margin:0 0 24px;line-height:1.6;">
                      Merci de confirmer votre adresse email afin de sécuriser votre compte HealSpace.
                      Le lien expire dans <strong>${safeExpiration} minutes</strong>.
                    </p>

                    <p style="margin:0 0 28px;">
                      <a href="${safeVerificationUrl}" style="display:inline-block;background:#6157e8;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:10px;">
                        Vérifier mon adresse email
                      </a>
                    </p>

                    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#566074;">
                      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                    </p>

                    <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;color:#6157e8;">
                      ${safeVerificationUrl}
                    </p>

                    <p style="margin:0;font-size:14px;line-height:1.6;color:#566074;">
                      Vous pouvez ignorer cet email si vous n'êtes pas à l'origine de cette demande.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return {
    subject,
    text,
    html,
  };
}
