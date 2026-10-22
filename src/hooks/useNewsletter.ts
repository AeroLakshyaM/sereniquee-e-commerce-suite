import { useMutation } from '@tanstack/react-query';

export function useSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Newsletter signup failed.');
      return true;
    },
  });
}
