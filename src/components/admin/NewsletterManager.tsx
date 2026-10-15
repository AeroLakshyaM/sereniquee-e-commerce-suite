import { useMemo, useState } from 'react';
import { Download, Mail } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string | null;
  is_active: boolean | null;
}

function markdownPreview(markdown: string): string {
  return markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br />');
}

export default function NewsletterManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { data: subscribers = [], isLoading, error } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async (): Promise<Subscriber[]> => {
      const { data, error: queryError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, subscribed_at, is_active')
        .order('subscribed_at', { ascending: false });
      if (queryError) throw queryError;
      return (data ?? []) as Subscriber[];
    },
  });

  const activeCount = useMemo(
    () => subscribers.filter(subscriber => subscriber.is_active).length,
    [subscribers],
  );

  const exportCsv = () => {
    const rows = [
      ['Email', 'Subscribed At', 'Active'],
      ...subscribers.map(subscriber => [
        subscriber.email,
        subscriber.subscribed_at ?? '',
        subscriber.is_active ? 'Yes' : 'No',
      ]),
    ];
    const csv = rows
      .map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'newsletter-subscribers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendNewsletter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast({ title: 'Complete the newsletter', description: 'Add a subject and message body.', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Your admin session has expired. Please sign in again.');

      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ subject: subject.trim(), markdown: body }),
      });
      const result = await response.json() as { sent?: number; failed?: number; error?: string };
      if (!response.ok) throw new Error(result.error || 'Newsletter could not be sent.');

      toast({
        title: 'Newsletter sent',
        description: `${result.sent ?? 0} sent${result.failed ? `, ${result.failed} failed` : ''}.`,
      });
      setSubject('');
      setBody('');
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    } catch (sendError) {
      toast({
        title: 'Newsletter failed',
        description: sendError instanceof Error ? sendError.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total subscribers</p>
            <p className="text-3xl font-semibold">{subscribers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active subscribers</p>
            <p className="text-3xl font-semibold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Subscribers</CardTitle>
          <Button variant="outline" onClick={exportCsv} disabled={subscribers.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">Loading subscribers...</p> : error ? (
            <p className="text-destructive">Unable to load subscribers. Check your admin permissions.</p>
          ) : subscribers.length === 0 ? (
            <p className="text-muted-foreground">No newsletter subscribers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="p-3">Email</th><th className="p-3">Subscribed at</th><th className="p-3">Status</th></tr></thead>
                <tbody>{subscribers.map(subscriber => (
                  <tr key={subscriber.id} className="border-b last:border-0">
                    <td className="p-3">{subscriber.email}</td>
                    <td className="p-3 text-muted-foreground">{subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleString() : '—'}</td>
                    <td className="p-3"><span className={subscriber.is_active ? 'text-green-600' : 'text-muted-foreground'}>{subscriber.is_active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Send Newsletter</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-6 lg:grid-cols-2" onSubmit={sendNewsletter}>
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="newsletter-subject">Subject line</Label><Input id="newsletter-subject" value={subject} onChange={event => setSubject(event.target.value)} placeholder="New scents have arrived" /></div>
              <div className="space-y-2"><Label htmlFor="newsletter-body">Message body (Markdown supported)</Label><Textarea id="newsletter-body" value={body} onChange={event => setBody(event.target.value)} placeholder="# Hello candle lovers!\n\nShare your latest news here..." rows={12} /></div>
              <Button type="submit" disabled={isSending || activeCount === 0}><Mail className="mr-2 h-4 w-4" />{isSending ? 'Sending...' : `Send to all active subscribers (${activeCount})`}</Button>
            </div>
            <div className="rounded-md border p-4">
              <p className="mb-3 text-sm font-medium">Markdown preview</p>
              {body ? <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: markdownPreview(body) }} /> : <p className="text-sm text-muted-foreground">Your preview will appear here.</p>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
