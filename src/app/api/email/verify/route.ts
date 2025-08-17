import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/email';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const to = process.env.NODEMAILER_EMAIL;
    if (!to) throw new Error('NODEMAILER_EMAIL is not set');

    await sendMail(
      '[HealthCheck] Email transport verification',
      to,
      'Transport OK'
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
