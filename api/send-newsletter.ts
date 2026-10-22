import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { brandedEmail } from './_lib/brandedEmail.js';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { reportApiError } from './_lib/reportError.js';

interface NewsletterRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: { subject?: string; markdown?: string };
}

interface NewsletterResponse {
  status: (code: number) => { json: (payload: unknown) => void };
}

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

  const authorization = req.headers?.authorization;
  const token = (Array.isArray(authorization) ? authorization[0] : authorization)?.replace(/^Bearer\s+/i, '');
  const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
  const markdown = typeof req.body?.markdown === 'string' ? req.body.markdown.trim() : '';
  if (!token || !subject || subject.length > 160 || !markdown || markdown.length > 30000) return res.status(400).json({ error: 'Provide a subject under 160 characters and message under 30,000 characters.' });

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      return res.status(500).json({
        error: 'Newsletter service is not configured. Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and RESEND_API_KEY in Vercel.',
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const resend = new Resend(resendApiKey);
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) return res.status(401).json({ error: 'Authentication required.' });
    const { data: role, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (roleError || !role) return res.status(403).json({ error: 'Admin access required.' });
    if (!await consumeRateLimit(req, 'admin:newsletter-broadcast', 3, 21600, `admin:${userData.user.id}`)) {
      return res.status(429).json({ error: 'Newsletter send limit reached. Please wait before sending another campaign.' });
    }

    const { data: subscribers, error: subscriberError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);
    if (subscriberError) throw subscriberError;
    if (!subscribers?.length) return res.status(200).json({ sent: 0, failed: 0 });

    const html = brandedEmail({
      title: subject,
      greeting: 'Dear Sereniquee community,',
      content: markdownToHtml(markdown),
      preheader: subject,
    });
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
    const incidentId = reportApiError('newsletter_broadcast_failed', error);
    return res.status(500).json({ error: 'Newsletter could not be sent. Check deployment logs before retrying.', incidentId });
  }
}
