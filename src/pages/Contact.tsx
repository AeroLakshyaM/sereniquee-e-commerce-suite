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
                    href="mailto:sereniqueecandles@gmail.com" 
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    sereniqueecandles@gmail.com
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
                    href="tel:+919827310636" 
                    className="text-muted-foreground hover:text-accent transition-colors block"
                  >
                    +91 - 9827310636
                  </a>
                  <a 
                    href="tel:+918770222006" 
                    className="text-muted-foreground hover:text-accent transition-colors block"
                  >
                    +91 - 8770222006
                  </a>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Mon-Sun: 7am - 10pm IST
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
                    131, Telephone Nagar Extension<br />
                    Indore 452018<br />
                    India
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

      {/* Google Maps Location */}
      <section className="py-16">
        <div className="container-luxury">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl mb-3">Find Us Here</h2>
            <p className="text-muted-foreground">
              Visit our studio in Indore, Madhya Pradesh
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl border border-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3517.1764805281423!2d75.90058437510707!3d22.72461857938375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962e2ca5524e715%3A0xccb490ec69aacddb!2s131%2C%20Telephone%20Nagar%2C%20Indore%2C%20Madhya%20Pradesh%20452018!5e1!3m2!1sen!2sin!4v1766750971044!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sereniquee Candles Location - 131, Telephone Nagar, Indore"
            />
          </div>
          <div className="mt-6 text-center">
            <a
              href="https://www.google.com/maps/dir//Telephone+Nagar,+Indore,+Madhya+Pradesh+452018"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Get directions on Google Maps
            </a>
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
                  <p>Monday to Sunday</p>
                  <p>7:00 AM - 10:00 PM IST</p>
                </div>
              </div>
              <div className="bg-background p-6 rounded-sm">
                <h3 className="font-semibold mb-3">Studio Visits</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>By appointment only</p>
                  <p>Monday to Sunday</p>
                  <p>Email or call us to schedule</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
