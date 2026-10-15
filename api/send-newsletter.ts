import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface NewsletterRequest {
  method?: string;
  headers?: { authorization?: string };
  body?: { subject?: string; markdown?: string };
}

interface NewsletterResponse {
  status: (code: number) => { json: (payload: unknown) => void };
}

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const resend = new Resend(process.env.RESEND_API_KEY);

function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br />');
}

export default async function handler(req: NewsletterRequest, res: NewsletterResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers?.authorization?.replace(/^Bearer\s+/i, '');
  const subject = req.body?.subject?.trim();
  const markdown = req.body?.markdown?.trim();
  if (!token || !subject || !markdown) return res.status(400).json({ error: 'Missing authorization, subject, or message.' });

  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) return res.status(401).json({ error: 'Authentication required.' });
    const { data: role, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (roleError || !role) return res.status(403).json({ error: 'Admin access required.' });

    const { data: subscribers, error: subscriberError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);
    if (subscriberError) throw subscriberError;
    if (!subscribers?.length) return res.status(200).json({ sent: 0, failed: 0 });

    const html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 680px; margin: 0 auto;">${markdownToHtml(markdown)}</div>`;
    const chunks: Array<typeof subscribers> = [];
    for (let index = 0; index < subscribers.length; index += 100) chunks.push(subscribers.slice(index, index + 100));
    const results = await Promise.allSettled(chunks.map(chunk => resend.batch.send(chunk.map(subscriber => ({
      from: 'Sereniquee Candles <team@sereniqueecandles.com>',
      to: subscriber.email,
      subject,
      html,
    })))));
    const sent = results.reduce((total, result, index) => (
      result.status === 'fulfilled' ? total + chunks[index].length : total
    ), 0);
    const failed = subscribers.length - sent;
    return res.status(failed ? 207 : 200).json({ sent, failed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send newsletter.';
    return res.status(500).json({ error: message });
  }
}
