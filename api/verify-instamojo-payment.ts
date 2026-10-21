import { createClient } from '@supabase/supabase-js';
import { sendPaymentConfirmation } from './_lib/sendPaymentConfirmation.js';

interface ApiRequest {
  method?: string;
  body?: { orderId?: string; paymentId?: string; paymentRequestId?: string };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.INSTAMOJO_API_KEY;
  const authToken = process.env.INSTAMOJO_AUTH_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = process.env.INSTAMOJO_BASE_URL || 'https://www.instamojo.com';
  const { orderId, paymentId, paymentRequestId } = req.body || {};
  if (!apiKey || !authToken || !supabaseUrl || !serviceKey) return res.status(503).json({ error: 'Payment service is not configured.' });
  if (!orderId || !paymentId || !paymentRequestId) return res.status(400).json({ error: 'Payment details are incomplete.' });

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: order, error: orderError } = await supabase.from('orders')
      .select('id, total_amount, payment_request_id, payment_status')
      .eq('id', orderId).maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.payment_request_id !== paymentRequestId) return res.status(404).json({ error: 'Payment does not match this order.' });
    if (order.payment_status === 'paid') return res.status(200).json({ paid: true });

    const paymentResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/api/1.1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { 'X-Api-Key': apiKey, 'X-Auth-Token': authToken, Accept: 'application/json' },
    });
    const payload = await paymentResponse.json() as { payment?: { status?: string; payment_request_id?: string; amount?: string | number } };
    const payment = payload.payment;
    if (!paymentResponse.ok || payment?.status !== 'Credit') return res.status(200).json({ paid: false });
    if (payment.payment_request_id && payment.payment_request_id !== paymentRequestId) return res.status(400).json({ error: 'Payment request does not match.' });
    if (payment.amount !== undefined && Number(payment.amount) !== Number(order.total_amount)) return res.status(400).json({ error: 'Payment amount does not match order.' });

    const { data: confirmed, error: confirmError } = await supabase.rpc('confirm_instamojo_payment', {
      p_order_id: order.id,
      p_payment_request_id: paymentRequestId,
      p_payment_id: paymentId,
    });
    if (confirmError) throw confirmError;
    if (!confirmed) return res.status(409).json({ error: 'Payment could not be matched.' });
    try {
      await sendPaymentConfirmation(supabase, order.id);
    } catch (emailError) {
      console.error('Payment confirmation email could not be sent:', emailError);
    }
    return res.status(200).json({ paid: true });
  } catch (error) {
    console.error('Instamojo payment verification failed:', error);
    return res.status(500).json({ error: 'Unable to verify payment right now.' });
  }
}
