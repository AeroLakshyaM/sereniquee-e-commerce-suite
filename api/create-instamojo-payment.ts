import { createClient } from '@supabase/supabase-js';

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: { orderId?: string; guestEmail?: string; guestPhone?: string };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
}

const getSupabase = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Payment service is not configured');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.INSTAMOJO_API_KEY;
  const authToken = process.env.INSTAMOJO_AUTH_TOKEN;
  const baseUrl = process.env.INSTAMOJO_BASE_URL || 'https://www.instamojo.com';
  const siteUrl = process.env.PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  if (!apiKey || !authToken || !siteUrl) {
    return res.status(503).json({ error: 'Instamojo payment settings are incomplete.' });
  }

  const orderId = req.body?.orderId;
  if (!orderId) return res.status(400).json({ error: 'Missing order reference.' });

  try {
    const supabase = getSupabase();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, user_id, guest_email, guest_name, guest_phone, payment_status, payment_url')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const authorization = req.headers.authorization;
    const token = Array.isArray(authorization) ? authorization[0] : authorization;
    if (order.user_id) {
      if (!token?.startsWith('Bearer ')) return res.status(401).json({ error: 'Sign in to continue payment.' });
      const { data: { user }, error: userError } = await supabase.auth.getUser(token.slice(7));
      if (userError || !user || user.id !== order.user_id) return res.status(403).json({ error: 'Order access could not be verified.' });
      order.guest_email = user.email || '';
      const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle();
      order.guest_name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer';
      order.guest_phone = profile?.phone || '';
    } else {
      const submittedEmail = req.body?.guestEmail?.trim().toLowerCase();
      const submittedPhone = req.body?.guestPhone?.replace(/\D/g, '');
      if (!submittedEmail || submittedEmail !== order.guest_email?.toLowerCase() || !submittedPhone || submittedPhone !== order.guest_phone?.replace(/\D/g, '')) {
        return res.status(403).json({ error: 'Guest order details could not be verified.' });
      }
    }

    if (order.payment_status === 'paid') return res.status(409).json({ error: 'This order has already been paid.' });
    if (order.payment_status === 'pending' && order.payment_url) {
      return res.status(200).json({ paymentUrl: order.payment_url });
    }

    const amount = Number(order.total_amount);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Order total is invalid.' });

    const body = new URLSearchParams({
      amount: amount.toFixed(2),
      purpose: order.order_number || order.id,
      buyer_name: order.guest_name || 'Customer',
      email: order.guest_email || '',
      phone: order.guest_phone || '',
      send_email: 'false',
      send_sms: 'false',
      allow_repeated_payments: 'false',
      redirect_url: `${siteUrl.replace(/\/$/, '')}/checkout?order_id=${encodeURIComponent(order.id)}`,
      webhook: `${siteUrl.replace(/\/$/, '')}/api/instamojo-webhook`,
    });

    const apiResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/api/1.1/payment-requests/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'X-Auth-Token': authToken,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const responseData = await apiResponse.json() as { payment_request?: { id?: string; longurl?: string }; message?: string };
    const paymentRequest = responseData.payment_request;
    if (!apiResponse.ok || !paymentRequest?.id || !paymentRequest.longurl) {
      console.error('Instamojo payment request creation failed:', apiResponse.status, responseData.message || 'No payment link returned');
      return res.status(502).json({ error: 'Instamojo could not create the payment link. Please try again.' });
    }

    const { error: updateError } = await supabase.from('orders').update({
      payment_provider: 'instamojo',
      payment_request_id: paymentRequest.id,
      payment_url: paymentRequest.longurl,
      payment_status: 'pending',
    }).eq('id', order.id).neq('payment_status', 'paid');
    if (updateError) throw updateError;

    return res.status(200).json({ paymentUrl: paymentRequest.longurl });
  } catch (error) {
    console.error('Unable to start Instamojo checkout:', error);
    return res.status(500).json({ error: 'Unable to start payment right now. Please try again.' });
  }
}
