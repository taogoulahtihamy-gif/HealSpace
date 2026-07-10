import { getMailTransporter } from "../config/mail.js";
import { env } from "../config/env.js";
import { buildEmailVerificationEmail } from "../templates/email-verification-email.template.js";
import { buildPasswordResetEmail } from "../templates/password-reset-email.template.js";

export async function sendMail({ to, subject, text, html }) {
  const transporter = getMailTransporter();

  const info = await transporter.sendMail({
    from: {
      name: env.MAIL_FROM_NAME,
      address: env.MAIL_FROM_ADDRESS,
    },
    to,
    subject,
    text,
    html,
  });

  if (env.NODE_ENV !== "production" && env.MAIL_TRANSPORT === "json") {
    console.log(`Email prepared for ${to}.`);
  }

  return {
    messageId: info.messageId || null,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
  };
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  resetUrl,
  expiresInMinutes,
}) {
  const email = buildPasswordResetEmail({
    firstName,
    resetUrl,
    expiresInMinutes,
  });

  return sendMail({
    to,
    ...email,
  });
}

export async function sendEmailVerificationEmail({
  to,
  firstName,
  verificationUrl,
  expiresInMinutes,
}) {
  const email = buildEmailVerificationEmail({
    firstName,
    verificationUrl,
    expiresInMinutes,
  });

  return sendMail({
    to,
    ...email,
  });
}
