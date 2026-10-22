import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      // 1. Save to Supabase (without .select() since anonymous users can't read from the table)
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);
        
      if (error && error.code !== '23505') throw error;
      if (error && error.code === '23505') {
        throw new Error("This email is already part of our community!");
      }

      // Send through the shared Sereniquee email layout.
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          type: 'newsletter-welcome',
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Failed to send welcome email via Resend API:', emailResponse.status, errorText);
      }

      return true;
    }
  });
}
