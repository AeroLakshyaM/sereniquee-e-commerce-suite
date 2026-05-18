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

      // Beautiful elegant HTML template for the email
      const htmlTemplate = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; text-align: center; padding: 40px 20px; background-color: #faf9f7;">
          <img src="https://www.sereniqueecandles.com/footer-logo.png" alt="Sereniquee Candles" style="max-height: 80px; margin-bottom: 20px;" />
          <h1 style="font-size: 28px; color: #1a1a1a; margin-bottom: 20px;">Welcome to Sereniquee</h1>
          <p style="font-size: 16px; margin-bottom: 30px;">Thank you for joining our community. We are thrilled to share our moments of serenity, new scent collections, and exclusive updates with you.</p>
          
          <div style="background-color: #fff; padding: 30px; border-radius: 8px; margin: 0 auto 30px; max-width: 400px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <p style="font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">Your Welcome Gift</p>
            <p style="font-size: 28px; font-weight: bold; color: #1a1a1a; margin: 10px 0; letter-spacing: 1px;">WELCOME10</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 0;">Use this code at checkout for 10% off your first order.</p>
          </div>
          
          <p style="font-size: 14px; color: #999;">Warmly,<br/>The Sereniquee Team</p>
        </div>
      `;

      // 2. Trigger the Resend Welcome Email using the Vercel edge function
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to the Sereniquee Community! ✨',
          html: htmlTemplate
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
