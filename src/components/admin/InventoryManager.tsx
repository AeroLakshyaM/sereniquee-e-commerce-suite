import { ChangeEvent, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type InventoryProduct = Product & { metadata?: Record<string, unknown> | null };

export default function InventoryManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStock, setDraftStock] = useState('');
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async (): Promise<InventoryProduct[]> => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as InventoryProduct[];
    },
  });

  const outOfStock = useMemo(() => products.filter(product => product.stock_quantity <= 0).length, [products]);
  const lowStock = useMemo(() => products.filter(product => product.stock_quantity > 0 && product.stock_quantity <= 5).length, [products]);

  const saveStock = async (product: InventoryProduct, value = draftStock) => {
    const stock = Number.parseInt(value, 10);
    setEditingId(null);
    if (!Number.isInteger(stock) || stock < 0 || stock === product.stock_quantity) return;
    const { error } = await supabase.from('products').update({ stock_quantity: stock }).eq('id', product.id);
    if (error) {
      toast({ title: 'Stock update failed', description: error.message, variant: 'destructive' });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const saveThreshold = async (product: InventoryProduct, value: string) => {
    const threshold = Number.parseInt(value, 10);
    if (!Number.isInteger(threshold) || threshold < 0) return;
    const metadata = { ...(product.metadata ?? {}), restock_alert_threshold: threshold };
    const { error } = await supabase.from('products').update({ metadata }).eq('id', product.id);
    if (error) toast({ title: 'Threshold update failed', description: error.message, variant: 'destructive' });
    else queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const rows = (await file.text()).split(/\r?\n/).map(row => row.trim()).filter(Boolean);
    const updates = rows.slice(1).map(row => row.split(',').map(value => value.trim())).map(([id, stock]) => ({
      id,
      stock_quantity: Number.parseInt(stock, 10),
    })).filter(update => update.id && Number.isInteger(update.stock_quantity) && update.stock_quantity >= 0);
    if (updates.length === 0) {
      toast({ title: 'No valid stock rows found', variant: 'destructive' });
      return;
    }
    const results = await Promise.all(updates.map(update => supabase.from('products').update({ stock_quantity: update.stock_quantity }).eq('id', update.id)));
    const failed = results.find(result => result.error)?.error;
    if (failed) toast({ title: 'CSV import failed', description: failed.message, variant: 'destructive' });
    else {
      toast({ title: `${updates.length} stock updates imported` });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Out of stock</p><p className="text-3xl font-semibold text-red-600">{outOfStock}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Low stock</p><p className="text-3xl font-semibold text-orange-600">{lowStock}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Inventory</CardTitle><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"><Upload className="h-4 w-4" /> Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} /></label></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">Loading inventory...</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Product</th><th className="p-3">Stock</th><th className="p-3">Restock threshold</th></tr></thead><tbody>
              {products.map(product => {
                const stock = product.stock_quantity ?? 0;
                const rowClass = stock === 0 ? 'bg-red-50 dark:bg-red-950/20' : stock <= 5 ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-green-50 dark:bg-green-950/20';
                const threshold = typeof product.metadata?.restock_alert_threshold === 'number' ? product.metadata.restock_alert_threshold : 5;
                return <tr key={product.id} className={`border-b ${rowClass}`}><td className="p-3 font-medium">{product.name}</td><td className="p-3">{editingId === product.id ? <Input autoFocus type="number" min={0} value={draftStock} onChange={event => setDraftStock(event.target.value)} onBlur={() => void saveStock(product)} onKeyDown={event => { if (event.key === 'Enter') void saveStock(product); }} className="w-24" /> : <button type="button" className="font-semibold underline-offset-2 hover:underline" onClick={() => { setEditingId(product.id); setDraftStock(String(stock)); }}>{stock}</button>}</td><td className="p-3"><Input type="number" min={0} defaultValue={threshold} onBlur={event => void saveThreshold(product, event.target.value)} className="w-28" /></td></tr>;
              })}
            </tbody></table></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
