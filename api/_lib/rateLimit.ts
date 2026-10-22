import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

interface RateLimitRequest { headers?: Record<string, string | string[] | undefined> }

export async function consumeRateLimit(req: RateLimitRequest, scope: string, limit: number, windowSeconds: number, identity?: string): Promise<boolean> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Rate limiting is not configured.');
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown';
  const source = identity || ip;
  const key = createHash('sha256').update(source).digest('hex');
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin.rpc('consume_api_rate_limit', {
    p_scope: scope,
    p_key_hash: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new Error(`Rate limiting failed: ${error.message}`);
  return data === true;
}
