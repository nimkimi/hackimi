import 'server-only';
import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const user = assertEnv('NODEMAILER_EMAIL');
  const pass = assertEnv('NODEMAILER_PASSWORD');

  const host = process.env.NODEMAILER_HOST || 'smtp.hostinger.com';
  const port = Number(process.env.NODEMAILER_PORT || 465);
  // Treat a defined-but-empty NODEMAILER_SECURE the same as unset so it falls
  // back to the port-based default (TLS on 465) rather than silently disabling TLS.
  const secureEnv = process.env.NODEMAILER_SECURE;
  const secure = secureEnv === undefined || secureEnv === '' ? port === 465 : secureEnv.toLowerCase() === 'true';

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  if (process.env.NODE_ENV !== 'production') {
    transporter.verify().catch((e) => console.warn('SMTP verify failed:', e?.message || e));
  }
  return transporter;
}

export async function sendMail(subject: string, toEmail: string, text: string, html?: string) {
  const t = getTransporter();
  const fromAddress = assertEnv('NODEMAILER_EMAIL');
  const fromName = process.env.NODEMAILER_NAME || 'Portfolio';
  const info = await t.sendMail({
    from: { address: fromAddress, name: fromName },
    to: toEmail,
    subject,
    text,
    html,
  });
  return info;
}
