import { Resend } from 'resend';

interface EmailRequest {
  method?: string;
  body?: {
    to?: string;
    subject?: string;
    html?: string;
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
const orderNotificationEmails = Array.from(new Set(
  (process.env.ORDER_NOTIFICATION_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
));

export default async function handler(req: EmailRequest, res: EmailResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, type } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const recipients = type === 'order-confirmation'
      ? orderNotificationEmails.filter((email) => email !== to.toLowerCase())
      : [];

    const buyerEmail = await resend.emails.send({
      // IMPORTANT: This 'from' email MUST be verified in your Resend dashboard!
      // For development, Resend allows sending from 'onboarding@resend.dev' ONLY to your own verified email address.
      from: 'Sereniquee Candles <team@sereniqueecandles.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (type !== 'order-confirmation') {
      return res.status(200).json(buyerEmail);
    }

    if (recipients.length < 2) {
      return res.status(502).json({
        error: 'Buyer email sent, but order notifications are not configured with two internal addresses different from the buyer.',
      });
    }

    const internalEmail = await resend.emails.send({
      from: 'Sereniquee Candles <team@sereniqueecandles.com>',
      to: recipients,
      subject: `[New order] ${subject}`,
      html,
    });

    res.status(200).json({ buyerEmail, internalEmail });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to send email';
    res.status(500).json({ error: message });
  }
}
