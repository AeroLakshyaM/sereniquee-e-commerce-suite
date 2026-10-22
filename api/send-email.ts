import { Resend } from 'resend';
import { brandedEmail } from './_lib/brandedEmail.js';

interface EmailRequest {
  method?: string;
  body?: {
    to?: string;
    type?: string;
  };
}

interface EmailResponse {
  status: (code: number) => {
    json: (payload: unknown) => void;
  };
}

// Vercel handles injecting the environment variable automatically
const resend = new Resend(process.env.RESEND_API_KEY);
export default async function handler(req: EmailRequest, res: EmailResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, type } = req.body || {};

  if (!to || !/^newsletter-welcome$/.test(type || '') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await resend.emails.send({
      from: 'Sereniquee Candles <team@sereniqueecandles.com>',
      to: [to],
      subject: 'A warm welcome to Sereniquee Candles',
      html: brandedEmail({
        title: 'Welcome to our community',
        greeting: 'Dear candle lover,',
        preheader: 'Your welcome gift is ready.',
        content: '<p>Thank you for joining the Sereniquee Candles community. We look forward to sharing new scents, thoughtful moments, and exclusive updates with you.</p><div style="margin:24px 0;padding:22px;text-align:center;background:#fbf8f3;border:1px solid #eee7de;border-radius:8px"><p style="margin:0 0 8px;color:#806346;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">Your welcome gift</p><p style="margin:0;font: bold 26px Georgia,serif;letter-spacing:2px">WELCOME10</p><p style="margin:8px 0 0;font-size:13px">Use it at checkout for 10% off your first order.</p></div>',
        cta: { label: 'Explore the collection', url: 'https://www.sereniqueecandles.com/shop' },
      }),
    });
    if (result.error) throw new Error(result.error.message);
    return res.status(200).json({ sent: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to send email';
    res.status(500).json({ error: message });
  }
}
