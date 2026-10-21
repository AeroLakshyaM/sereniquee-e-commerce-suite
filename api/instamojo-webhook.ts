import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentConfirmation } from './_lib/sendPaymentConfirmation.js';

interface ApiRequest {
  method?: string;
  body?: Record<string, string | string[] | undefined> | string | Buffer;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
  send: (payload: string) => void;
}

function parseBody(body: ApiRequest['body']): Record<string, string> {
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return Object.fromEntries(new URLSearchParams(body.toString()).entries());
  }
  return Object.fromEntries(Object.entries(body || {}).flatMap(([key, value]) => {
    if (value === undefined) return [];
    return [[key, Array.isArray(value) ? value[0] || '' : value]];
  }));
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const salt = process.env.INSTAMOJO_PRIVATE_SALT;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!salt || !supabaseUrl || !serviceKey) return res.status(503).send('Payment service is not configured');

  const data = parseBody(req.body);
  const providedMac = data.mac;
  if (!providedMac) return res.status(400).send('Missing MAC');
  const macFields = { ...data };
  delete macFields.mac;
  const message = Object.entries(macFields)
    .sort(([a], [b]) => {
      const first = a.toLowerCase();
      const second = b.toLowerCase();
      return first < second ? -1 : first > second ? 1 : 0;
    })
    .map(([, value]) => value)
    .join('|');
  const expectedMac = createHmac('sha1', salt).update(message).digest('hex');
  const expectedBuffer = Buffer.from(expectedMac, 'hex');
  const providedBuffer = Buffer.from(providedMac, 'hex');
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return res.status(400).send('MAC mismatch');
  }

  const requestId = data.payment_request_id;
  const paymentId = data.payment_id;
  const status = data.status;
  if (!requestId || !paymentId || !status) return res.status(400).send('Missing payment fields');

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount')
      .eq('payment_request_id', requestId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return res.status(404).send('Order not found');

    const matchesOrder = data.purpose === order.order_number || data.purpose === order.id;
    const matchesAmount = Number(data.amount) === Number(order.total_amount);
    if (!matchesOrder || !matchesAmount || (data.currency && data.currency !== 'INR')) {
      return res.status(400).send('Payment does not match order');
    }

    if (status === 'Credit') {
      const { data: confirmed, error: confirmError } = await supabase.rpc('confirm_instamojo_payment', {
        p_order_id: order.id,
        p_payment_request_id: requestId,
        p_payment_id: paymentId,
      });
      if (confirmError) throw confirmError;
      if (!confirmed) return res.status(409).send('Payment could not be matched');
      try {
        await sendPaymentConfirmation(supabase, order.id);
      } catch (emailError) {
        console.error('Payment confirmation email could not be sent:', emailError);
      }
      return res.status(200).send('OK');
    }

    if (status === 'Failed') {
      const { error: updateError } = await supabase.from('orders').update({ payment_status: 'failed' })
        .eq('id', order.id).neq('payment_status', 'paid');
      if (updateError) throw updateError;
      return res.status(200).send('OK');
    }

    return res.status(400).send('Unknown payment status');
  } catch (error) {
    console.error('Instamojo webhook processing failed:', error);
    return res.status(500).send('Unable to process payment notification');
  }
}
