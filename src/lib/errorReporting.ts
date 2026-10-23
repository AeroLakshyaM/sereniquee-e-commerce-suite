type ClientErrorEvent = 'checkout_failure' | 'payment_email_failure' | 'unhandled_rejection' | 'unhandled_error' | 'render_error';

export function reportClientError(event: ClientErrorEvent, error: unknown) {
  const value = error as { message?: unknown; code?: unknown } | null;
  const message = typeof error === 'string'
    ? error.slice(0, 400)
    : typeof value?.message === 'string' ? value.message.slice(0, 400) : 'Unknown client error';
  const code = typeof value?.code === 'string' ? value.code.slice(0, 40) : undefined;
  // Keep a local trace for immediate support and send a low-detail copy to Vercel logs.
  console.error(JSON.stringify({ event, code, message }));
  void fetch('/api/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, code, message }),
    keepalive: true,
  }).catch(() => undefined);
}
