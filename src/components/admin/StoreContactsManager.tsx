import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, Loader2, Mail, Phone, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type StoreContact = Database['public']['Tables']['store_contacts']['Row'];

export default function StoreContactsManager() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: contacts = [], isLoading, isError } = useQuery({
    queryKey: ['admin-store-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_contacts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((contact) => [contact.name, contact.email, contact.phone, contact.interest_type, contact.message, contact.internal_note]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [contacts, search]);

  const updateContact = async (id: string, patch: { status?: StoreContact['status']; internal_note?: string | null }) => {
    const { error } = await supabase.from('store_contacts').update(patch).eq('id', id);
    if (error) { toast({ title: 'Could not update contact', description: error.message, variant: 'destructive' }); return; }
    await queryClient.invalidateQueries({ queryKey: ['admin-store-contacts'] });
    toast({ title: 'Contact updated' });
  };

  const exportContacts = () => {
    const columns: (keyof StoreContact)[] = ['name', 'email', 'phone', 'interest_type', 'message', 'marketing_consent', 'status', 'source', 'created_at'];
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [columns.join(','), ...visible.map((contact) => columns.map((column) => escape(contact[column])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `sereniquee-store-contacts-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><CardTitle>Store Contacts</CardTitle><CardDescription>Exhibition and mobile store follow-ups. Marketing updates are recorded only for opted-in contacts.</CardDescription></div>
          <Button variant="outline" onClick={exportContacts} disabled={!visible.length}><Download className="mr-2 h-4 w-4" />Export visible</Button>
        </div>
        <div className="relative mt-3 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts..." className="pl-9" /></div>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin" /></div>
          : isError ? <p className="py-10 text-center text-sm text-destructive">Could not load contacts. Check your admin access and try again.</p>
            : !visible.length ? <p className="py-10 text-center text-sm text-muted-foreground">No store contacts yet. New exhibition form submissions will appear here.</p>
              : <div className="space-y-4">{visible.map((contact) => (
                <article key={contact.id} className="rounded-xl border border-border p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{contact.name}</h3><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{contact.status}</span></div>
                      <p className="mt-1 text-xs text-muted-foreground">{format(new Date(contact.created_at), 'PPP · p')} · {contact.interest_type.replaceAll('_', ' ')}</p></div>
                    <Select value={contact.status} onValueChange={(status) => void updateContact(contact.id, { status })}>
                      <SelectTrigger className="h-9 w-36" aria-label={`Update status for ${contact.name}`}><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="complete">Complete</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {contact.phone && <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-2 underline"><Phone className="h-4 w-4" />{contact.phone}</a>}
                    {contact.email && <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 underline"><Mail className="h-4 w-4" />{contact.email}</a>}
                    {contact.phone && <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground">WhatsApp <ExternalLink className="h-3 w-3" /></a>}
                  </div>
                  {contact.message && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{contact.message}</p>}
                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                    <Input key={`${contact.id}-${contact.internal_note ?? ''}`} defaultValue={contact.internal_note ?? ''} maxLength={1000} aria-label={`Internal note for ${contact.name}`} placeholder="Private team note (optional)" onBlur={(event) => {
                      const value = event.currentTarget.value.trim() || null;
                      if (value !== contact.internal_note) void updateContact(contact.id, { internal_note: value });
                    }} />
                    <span className="text-xs text-muted-foreground">{contact.marketing_consent ? 'Opted in to updates' : 'No marketing opt-in'}</span>
                  </div>
                </article>
              ))}</div>}
      </CardContent>
    </Card>
  );
}
