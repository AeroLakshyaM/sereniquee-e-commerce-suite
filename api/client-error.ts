import { consumeRateLimit } from './_lib/rateLimit.js';
import { randomUUID } from 'node:crypto';

interface Request { method?: string; headers?: Record<string, string | string[] | undefined>; body?: { event?: string; message?: string; code?: string } }
interface Response { status: (code: number) => { json: (payload: unknown) => void; end?: () => void } }

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const event = req.body?.event;
  const message = req.body?.message?.trim().slice(0, 400);
  const code = req.body?.code?.slice(0, 40);
  if (!['checkout_failure', 'payment_email_failure'].includes(event || '') || !message) return res.status(400).json({ error: 'Invalid error report.' });
  try {
    if (!await consumeRateLimit(req, 'client:error-report', 20, 3600)) return res.status(429).json({ error: 'Error report limit reached.' });
    const incidentId = randomUUID();
    console.error(JSON.stringify({ event: 'client_error_report', incidentId, clientEvent: event, code, message }));
    return res.status(202).json({ received: true, incidentId });
  } catch {
    return res.status(503).json({ error: 'Error reporting is temporarily unavailable.' });
  }
}
