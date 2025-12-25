import { useState, FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Replace these with your actual EmailJS credentials
      const serviceId = 'service_20swgy8';
      const templateId = 'template_0njrv4g';
      const publicKey = '5NICP9CqMEBx1a7kN';

      // Add reply_to field so you can reply directly to the sender
      const emailParams = {
        name: formData.from_name, // Match template variable {{name}}
        email: formData.from_email, // Add email variable for template {{email}}
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.from_email, // This allows you to reply directly
        time: new Date().toLocaleString(), // Add timestamp for {{time}}
      };

      await emailjs.send(
        serviceId,
        templateId,
        emailParams,
        publicKey
      );

      toast({
        title: 'Message sent!',
        description: 'Thank you for reaching out. We\'ll get back to you soon.',
      });

      // Reset form
      setFormData({
        from_name: '',
        from_email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again or email us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary py-24">
        <div className="container-luxury text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Get In Touch
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto">
            We'd Love to Hear From You
          </h1>
        </div>
      </section>

      {/* Contact Content */}
      <section className="container-luxury py-24">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="font-serif text-3xl mb-6">Let's Connect</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Have a question about our candles, need help with an order, or just want 
              to share your experience? We're here to help. Send us a message and we'll 
              respond within 24 hours.
            </p>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <a 
                    href="mailto:hello@sereniquee.com" 
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    hello@sereniquee.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <a 
                    href="tel:+11234567890" 
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    +1 (123) 456-7890
                  </a>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Mon-Fri: 9am - 6pm EST
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Visit Our Studio</h3>
                  <p className="text-muted-foreground">
                    123 Candle Lane<br />
                    Brooklyn, NY 11201<br />
                    United States
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    By appointment only
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="mt-12 p-6 bg-secondary rounded-sm">
              <h3 className="font-serif text-xl mb-2">Quick Questions?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Check our FAQ page for instant answers to common questions about 
                our products, shipping, and care instructions.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/faq">View FAQ</a>
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border p-8 rounded-sm">
            <h2 className="font-serif text-2xl mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="from_name" className="block text-sm font-medium mb-2">
                  Your Name *
                </label>
                <Input
                  id="from_name"
                  name="from_name"
                  type="text"
                  required
                  value={formData.from_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="from_email" className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  id="from_email"
                  name="from_email"
                  type="email"
                  required
                  value={formData.from_email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  className="w-full resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting this form, you agree to our privacy policy.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="bg-secondary py-16">
        <div className="container-luxury">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl mb-8">Business Hours</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-background p-6 rounded-sm">
                <h3 className="font-semibold mb-3">Customer Support</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
              <div className="bg-background p-6 rounded-sm">
                <h3 className="font-semibold mb-3">Studio Visits</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>By appointment only</p>
                  <p>Tuesday - Saturday</p>
                  <p>Email us to schedule</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
