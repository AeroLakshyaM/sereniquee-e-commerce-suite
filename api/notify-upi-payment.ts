import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface Request { method?: string; headers?: { authorization?: string }; body?: { orderId?: string; event?: 'submitted' | 'received' } }
interface Response { status: (code: number) => { json: (payload: unknown) => void } }
const internalRecipients = ['sereniqueecandles@gmail.com', 'lakshyamishra099@gmail.com'];
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);

function emailHtml(title: string, greeting: string, content: string) {
  return `<div style="margin:0;background:#f7f4ef;padding:32px 12px;font-family:Arial,sans-serif;color:#332b27"><div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e8dfd4;border-radius:12px;overflow:hidden"><div style="padding:28px 32px;text-align:center;background:#faf7f2"><img src="https://www.sereniqueecandles.com/footer-logo.png" alt="Sereniquee Candles" style="display:block;max-width:190px;max-height:72px;width:auto;margin:0 auto 14px"/><div style="font-size:12px;letter-spacing:2px;color:#8a6b4e;text-transform:uppercase">Hand-poured with care</div></div><div style="padding:32px"><h1 style="margin:0 0 18px;font:normal 28px Georgia,serif;color:#3e3026">${title}</h1><p style="line-height:1.65">${greeting}</p>${content}<p style="margin-top:28px;line-height:1.7">Warm regards,<br/><strong>Sereniquee Candles</strong></p></div><div style="padding:16px 32px;background:#faf7f2;color:#786d64;font-size:12px;text-align:center">Sereniquee Candles · Thoughtfully made, beautifully yours</div></div></div>`;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const orderId = req.body?.orderId;
  const event = req.body?.event;
  if (!orderId || (event !== 'submitted' && event !== 'received')) return res.status(400).json({ error: 'Invalid payment notification request.' });
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!supabaseUrl || !serviceKey || !resendKey) return res.status(500).json({ error: 'Payment email service is not configured.' });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const resend = new Resend(resendKey);
  try {
    if (event === 'received') {
      const token = req.headers?.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return res.status(401).json({ error: 'Authentication required.' });
      const { data: userResult, error: userError } = await admin.auth.getUser(token);
      if (userError || !userResult.user) return res.status(401).json({ error: 'Authentication required.' });
      const { data: role } = await admin.from('user_roles').select('role').eq('user_id', userResult.user.id).eq('role', 'admin').maybeSingle();
      if (!role) return res.status(403).json({ error: 'Admin access required.' });
    }
    const { data: order, error } = await admin.from('orders').select('id, order_number, total_amount, payment_status, payment_method, utr_number, guest_email, guest_name, user_id').eq('id', orderId).maybeSingle();
    if (error) throw error;
    if (!order || (event === 'submitted' && order.payment_status !== 'submitted_for_verification') || (event === 'received' && order.payment_status !== 'paid')) return res.status(409).json({ error: 'Order payment state does not match this notification.' });
    const flag = event === 'submitted' ? 'upi_submission_email_sent' : 'upi_received_email_sent';
    const { data: claimed, error: claimError } = await admin.from('orders').update({ [flag]: true }).eq('id', orderId).eq(flag, false).select('id').maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return res.status(200).json({ sent: false, reason: 'already-sent' });
    let customerEmail = order.guest_email;
    if (!customerEmail && order.user_id) {
      const { data: profile } = await admin.from('profiles').select('email').eq('id', order.user_id).maybeSingle();
      customerEmail = profile?.email || null;
    }
    if (!customerEmail) { await admin.from('orders').update({ [flag]: false }).eq('id', orderId); return res.status(422).json({ error: 'Customer email is not available.' }); }
    const orderLabel = order.order_number || order.id.slice(0, 8).toUpperCase();
    const received = event === 'received';
    const isCod = order.payment_method === 'cod';
    const subject = received ? `${isCod ? 'Cash on delivery collected' : 'Payment received'} · Order ${orderLabel}` : `UPI payment submitted · Order ${orderLabel}`;
    const greeting = received ? `Dear ${escapeHtml(order.guest_name || 'Customer')},` : `Dear ${escapeHtml(order.guest_name || 'Customer')},`;
    const content = received
      ? `<p style="line-height:1.65">${isCod ? 'Our team has recorded the cash payment collected on delivery.' : 'We have verified your UPI payment.'} Your order payment is now marked as received.</p><div style="padding:18px;background:#faf7f2;border-radius:8px;line-height:1.9"><strong>Order:</strong> ${escapeHtml(orderLabel)}<br/><strong>Amount received:</strong> ₹${Number(order.total_amount).toFixed(2)}${isCod ? '' : `<br/><strong>UTR (Transaction ID):</strong> ${escapeHtml(order.utr_number || '')}`}</div>`
      : `<p style="line-height:1.65">We have received your payment details and they are awaiting manual verification. Your order will be confirmed as soon as our team verifies the transaction.</p><div style="padding:18px;background:#faf7f2;border-radius:8px;line-height:1.9"><strong>Order:</strong> ${escapeHtml(orderLabel)}<br/><strong>Amount:</strong> ₹${Number(order.total_amount).toFixed(2)}<br/><strong>Submitted UTR:</strong> ${escapeHtml(order.utr_number || '')}<br/><strong>Status:</strong> Pending verification</div>`;
    const html = emailHtml(received ? 'Payment confirmed' : 'Payment details received', greeting, content);
    const result = await resend.batch.send([
      { from: 'Sereniquee Candles <team@sereniqueecandles.com>', to: customerEmail, subject, html },
      ...internalRecipients.map(to => ({ from: 'Sereniquee Candles <team@sereniqueecandles.com>', to, subject: `${received ? (isCod ? '[COD collected]' : '[Payment received]') : '[Payment submitted]'} ${orderLabel}`, html: emailHtml(received ? (isCod ? 'Cash collected on delivery' : 'Payment received') : 'UPI payment submitted for review', 'Dear Sereniquee Candles team,', `${content}<p style="line-height:1.65">Customer: ${escapeHtml(order.guest_name || customerEmail)}</p><p>Please review the order in the admin dashboard.</p>`) })),
    ]);
    if (result.error) throw new Error(result.error.message);
    return res.status(200).json({ sent: true });
  } catch (error) {
    await admin.from('orders').update({ [event === 'submitted' ? 'upi_submission_email_sent' : 'upi_received_email_sent']: false }).eq('id', orderId);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to send payment email.' });
  }
}
