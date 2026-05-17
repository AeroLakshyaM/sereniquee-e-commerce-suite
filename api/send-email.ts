import { Resend } from 'resend';

// Vercel handles injecting the environment variable automatically
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const data = await resend.emails.send({
      // IMPORTANT: This 'from' email MUST be verified in your Resend dashboard!
      // For development, Resend allows sending from 'onboarding@resend.dev' ONLY to your own verified email address.
      from: 'Sereniquee Candles <team@sereniqueecandles.com>', 
      to: [to],
      subject: subject,
      html: html,
    });

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
