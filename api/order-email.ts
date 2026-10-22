import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { brandedEmail, escapeEmailHtml } from './_lib/brandedEmail';

type Event = 'payment-reminder' | 'order-confirmation' | 'tracking';
interface Request { method?: string; headers?: { authorization?: string }; body?: { orderId?: string; event?: Event } }
interface Response { status: (code: number) => { json: (payload: unknown) => void } }
const from = 'Sereniquee Candles <team@sereniqueecandles.com>';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const orderId = req.body?.orderId;
  const event = req.body?.event;
  if (!orderId || !event || !['payment-reminder', 'order-confirmation', 'tracking'].includes(event)) {
    return res.status(400).json({ error: 'Invalid order email request.' });
  }
  const token = req.headers?.authorization?.replace(/^Bearer\s+/i, '');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!token || !supabaseUrl || !serviceKey || !resendKey) return res.status(401).json({ error: 'Admin authorization or email service is unavailable.' });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  try {
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return res.status(401).json({ error: 'Please sign in as an administrator.' });
    const { data: role } = await admin.from('user_roles').select('role').eq('user_id', authData.user.id).eq('role', 'admin').maybeSingle();
    if (!role) return res.status(403).json({ error: 'Administrator access required.' });

    const { data: order, error: orderError } = await admin.from('orders')
      .select('id, order_number, order_source, status, payment_method, payment_status, payment_expires_at, payment_resume_token, payment_resume_token_expires_at, total_amount, tracking_number, guest_email, guest_name, user_id, shipping_address, created_at')
      .eq('id', orderId).maybeSingle();
    if (orderError) throw orderError;
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    let customerEmail = order.guest_email;
    if (!customerEmail && order.user_id) {
      const { data: profile } = await admin.from('profiles').select('email, full_name').eq('id', order.user_id).maybeSingle();
      customerEmail = profile?.email || null;
      order.guest_name = order.guest_name || profile?.full_name || null;
    }
    if (!customerEmail) return res.status(422).json({ error: 'The customer email address is unavailable.' });
    const orderLabel = order.order_number || 'your order';
    const customerName = escapeEmailHtml(order.guest_name || 'Customer');
    const amount = `₹${Number(order.total_amount).toFixed(2)}`;
    const resend = new Resend(resendKey);

    if (event === 'payment-reminder') {
      if (order.order_source !== 'online' || order.payment_method !== 'upi' || order.payment_status !== 'pending_payment') {
        return res.status(409).json({ error: 'Only an active, unpaid UPI attempt can receive a payment reminder.' });
      }
      const now = Date.now();
      if (!order.payment_expires_at || new Date(order.payment_expires_at).getTime() <= now) {
        return res.status(409).json({ error: 'The payment window has expired. The customer can start a new checkout.' });
      }
      const resumeToken = order.payment_resume_token && order.payment_resume_token_expires_at && new Date(order.payment_resume_token_expires_at).getTime() > now
        ? order.payment_resume_token
        : randomBytes(32).toString('hex');
      const expiresAt = new Date(now + 15 * 60 * 1000).toISOString();
      const { data: renewed, error: renewError } = await admin.from('orders')
        .update({ payment_expires_at: expiresAt, payment_resume_token: resumeToken, payment_resume_token_expires_at: expiresAt })
        .eq('id', orderId).eq('payment_status', 'pending_payment').select('id').maybeSingle();
      if (renewError) throw renewError;
      if (!renewed) return res.status(409).json({ error: 'This payment attempt is no longer active.' });
      const siteUrl = (process.env.SITE_URL || 'https://www.sereniqueecandles.com').replace(/\/$/, '');
      const resumeUrl = `${siteUrl}/checkout?resume=${encodeURIComponent(orderId)}&token=${encodeURIComponent(resumeToken)}`;
      const result = await resend.emails.send({
        from, to: customerEmail, subject: `Continue your UPI payment · Sereniquee Candles`,
        html: brandedEmail({
          title: 'Your payment is still pending',
          greeting: `Dear ${customerName},`,
          preheader: 'Continue your secure UPI checkout.',
          content: `<p>Your order is waiting for UPI payment. Use the button below to return to checkout, pay the displayed total, and submit your UTR (Transaction ID).</p><div style="padding:18px;background:#fbf8f3;border:1px solid #eee7de;border-radius:8px"><strong>Order:</strong> ${escapeEmailHtml(orderLabel)}<br><strong>Total:</strong> ${amount}<br><strong>Payment window:</strong> 15 minutes from this email</div><p>If you no longer wish to pay by UPI, you can cancel this payment attempt from checkout.</p>`,
          cta: { label: 'Continue to payment', url: resumeUrl },
        }),
      });
      if (result.error) throw new Error(result.error.message);
      return res.status(200).json({ sent: true });
    }

    if (event === 'order-confirmation') {
      if (order.payment_status !== 'paid' || order.status === 'cancelled') return res.status(409).json({ error: 'Confirm payment before sending the order confirmation.' });
      const [{ data: items, error: itemsError }, { data: products, error: productsError }] = await Promise.all([
        admin.from('order_items').select('product_id, quantity, price_at_time').eq('order_id', orderId),
        admin.from('products').select('id, name'),
      ]);
      if (itemsError) throw itemsError;
      if (productsError) throw productsError;
      const productMap = new Map((products || []).map(product => [product.id, product.name]));
      const itemRows = (items || []).map(item => `<tr><td style="padding:10px;border-bottom:1px solid #eee7de">${escapeEmailHtml(productMap.get(item.product_id) || 'Candle')}</td><td style="padding:10px;border-bottom:1px solid #eee7de;text-align:center">${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee7de;text-align:right">₹${(Number(item.price_at_time) * item.quantity).toFixed(2)}</td></tr>`).join('');
      const result = await resend.emails.send({
        from, to: customerEmail, subject: `Your order is confirmed · Sereniquee Candles`,
        html: brandedEmail({
          title: 'Your order is confirmed',
          greeting: `Dear ${customerName},`,
          preheader: 'Your payment is confirmed and your order is being prepared.',
          content: `<p>We have confirmed your payment and your order is now being prepared with care.</p><div style="padding:18px;background:#fbf8f3;border:1px solid #eee7de;border-radius:8px"><strong>Order:</strong> ${escapeEmailHtml(orderLabel)}<br><strong>Order date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}<br><strong>Payment:</strong> ${order.payment_method === 'cod' ? 'Cash on delivery · received' : 'UPI · received'}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-collapse:collapse"><thead><tr><th align="left" style="padding:10px;background:#fbf8f3">Item</th><th style="padding:10px;background:#fbf8f3">Qty</th><th align="right" style="padding:10px;background:#fbf8f3">Amount</th></tr></thead><tbody>${itemRows}</tbody></table><p style="text-align:right;font-size:17px"><strong>Total: ${amount}</strong></p>${order.shipping_address ? `<p><strong>Delivery address</strong><br>${escapeEmailHtml(order.shipping_address).replace(/\r?\n/g, '<br>')}</p>` : ''}${order.tracking_number ? `<p><strong>Tracking number:</strong> ${escapeEmailHtml(order.tracking_number)}</p>` : ''}`,
        }),
      });
      if (result.error) throw new Error(result.error.message);
      return res.status(200).json({ sent: true });
    }

    if (order.status !== 'shipped' || !order.tracking_number) return res.status(409).json({ error: 'Add tracking details before sending a shipping update.' });
    const trackingResult = await resend.emails.send({
      from, to: customerEmail, subject: 'Your Sereniquee Candles order is on its way',
      html: brandedEmail({
        title: 'Your order has shipped',
        greeting: `Dear ${customerName},`,
        content: `<p>Your order is on its way. Thank you for choosing Sereniquee Candles.</p><div style="padding:18px;background:#fbf8f3;border:1px solid #eee7de;border-radius:8px"><strong>Order:</strong> ${escapeEmailHtml(orderLabel)}<br><strong>Tracking number:</strong> ${escapeEmailHtml(order.tracking_number)}</div>`,
      }),
    });
    if (trackingResult.error) throw new Error(trackingResult.error.message);
    return res.status(200).json({ sent: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to send this email.' });
  }
}
