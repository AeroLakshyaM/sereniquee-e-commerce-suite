import { Resend } from 'resend';
import { brandedEmail, escapeEmailHtml } from './_lib/brandedEmail';

interface ContactRequest {
  method?: string;
  body?: { name?: string; email?: string; subject?: string; message?: string };
}
interface ContactResponse { status: (code: number) => { json: (payload: unknown) => void } }

export default async function handler(req: ContactRequest, res: ContactResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim();
  const subject = req.body?.subject?.trim();
  const message = req.body?.message?.trim();
  if (!name || name.length > 120 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !subject || subject.length > 180 || !message || message.length > 6000) {
    return res.status(400).json({ error: 'Please provide a valid name, email, subject, and message.' });
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: 'Contact email service is not configured.' });
  try {
    const resend = new Resend(key);
    const safeName = escapeEmailHtml(name);
    const safeEmail = escapeEmailHtml(email);
    const safeSubject = escapeEmailHtml(subject);
    const safeMessage = escapeEmailHtml(message).replace(/\r?\n/g, '<br>');
    const result = await resend.batch.send([
      {
        from: 'Sereniquee Candles <team@sereniqueecandles.com>',
        to: 'sereniqueecandles@gmail.com',
        replyTo: email,
        subject: `Website enquiry: ${subject}`,
        html: brandedEmail({ title: 'New website enquiry', greeting: 'A customer has sent a message through the contact form.', content: `<div style="padding:18px;background:#fbf8f3;border-radius:8px"><p><strong>From:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Subject:</strong> ${safeSubject}</p><p><strong>Message:</strong><br>${safeMessage}</p></div>` }),
      },
      {
        from: 'Sereniquee Candles <team@sereniqueecandles.com>',
        to: email,
        subject: 'We received your message · Sereniquee Candles',
        html: brandedEmail({ title: 'Thank you for contacting us', greeting: `Dear ${safeName},`, content: `<p>We have received your message about <strong>${safeSubject}</strong>. Our team will get back to you as soon as possible.</p>` }),
      },
    ]);
    if (result.error) throw new Error(result.error.message);
    return res.status(200).json({ sent: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to send your message.' });
  }
}
