import nodemailer from "nodemailer";

import { env } from "./env.js";

let transporter = null;

function createSmtpTransporter() {
  if (!env.SMTP_HOST) {
    throw new Error(
      "SMTP_HOST est obligatoire lorsque MAIL_TRANSPORT=smtp.",
    );
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
          }
        : undefined,
    tls: {
      minVersion: "TLSv1.2",
    },
  });
}

function createJsonTransporter() {
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

export function getMailTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter =
    env.MAIL_TRANSPORT === "smtp"
      ? createSmtpTransporter()
      : createJsonTransporter();

  return transporter;
}
