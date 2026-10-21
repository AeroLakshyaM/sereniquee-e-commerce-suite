import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] || character));

export async function sendPaymentConfirmation(supabase: SupabaseClient, orderId: string) {
  if (!process.env.RESEND_API_KEY) return;

  const { data: order, error: orderError } = await supabase.from('orders')
    .select('id, order_number, total_amount, guest_email, guest_name, user_id, payment_confirmation_email_sent, status')
    .eq('id', orderId).maybeSingle();
  if (orderError) throw orderError;
  if (!order || order.payment_confirmation_email_sent || order.payment_status !== 'paid') return;

  let email = order.guest_email;
  let name = order.guest_name || 'Customer';
  if (!email && order.user_id) {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(order.user_id);
    if (authError) throw authError;
    email = authUser.user.email || null;
    name = authUser.user.user_metadata?.full_name || email?.split('@')[0] || name;
  }
  if (!email) return;

  const { data: items, error: itemsError } = await supabase.from('order_items')
    .select('quantity, price_at_time, products(name)')
    .eq('order_id', orderId);
  if (itemsError) throw itemsError;

  // Claim the email before sending to prevent duplicate webhook/redirect notices.
  const { data: claimed, error: claimError } = await supabase.from('orders')
    .update({ payment_confirmation_email_sent: true })
    .eq('id', orderId).eq('payment_confirmation_email_sent', false).select('id').maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) return;

  const orderRef = escapeHtml(order.order_number || order.id);
  const lineItems = (items || []).map(item => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    const productName = escapeHtml(product?.name || 'Product');
    return `<li>${productName} × ${item.quantity} — ₹${(Number(item.price_at_time) * item.quantity).toFixed(2)}</li>`;
  }).join('');
  const nextStep = order.status === 'processing'
    ? 'Your order is now being prepared.'
    : 'Our team will contact you shortly with an update about your order.';
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: 'Sereniquee Candles <team@sereniqueecandles.com>',
    to: [email],
    subject: `Payment confirmed for order ${orderRef}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#333"><h1 style="font-family:Georgia,serif">Payment confirmed</h1><p>Hi ${escapeHtml(name)},</p><p>We have received your payment for order <strong>${orderRef}</strong>. ${nextStep}</p><ul>${lineItems}</ul><p><strong>Total paid: ₹${Number(order.total_amount).toFixed(2)}</strong></p><p>Warm regards,<br/>The Sereniquee Team</p></div>`,
  });

  if (result.error) {
    await supabase.from('orders').update({ payment_confirmation_email_sent: false }).eq('id', orderId);
    throw result.error;
  }
}
