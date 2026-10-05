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

    if (type === 'order-confirmation' && recipients.length < 2) {
      return res.status(500).json({
        error: 'Order notifications are not configured with two internal addresses different from the buyer.',
      });
    }

    const data = await resend.emails.send({
      // IMPORTANT: This 'from' email MUST be verified in your Resend dashboard!
      // For development, Resend allows sending from 'onboarding@resend.dev' ONLY to your own verified email address.
      from: 'Sereniquee Candles <team@sereniqueecandles.com>',
      to: [to],
      ...(recipients.length > 0 ? { bcc: recipients } : {}),
      subject: subject,
      html: html,
    });

    res.status(200).json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to send email';
    res.status(500).json({ error: message });
  }
}
