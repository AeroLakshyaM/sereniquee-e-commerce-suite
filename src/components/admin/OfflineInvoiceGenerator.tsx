import { useEffect, useMemo, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { openInvoiceInNewTab } from '@/lib/invoiceGenerator';

interface InvoiceLine {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

const INDIA_SHIPPING = 100;
const INTERNATIONAL_SHIPPING = 500;
const GST_RATE = 0.05;
const INVOICE_DRAFT_STORAGE_KEY = 'sereniquee_offline_invoice_draft';

interface InvoiceDraft {
  productSearch: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingOption: 'India' | 'International' | 'custom' | 'none';
  customShipping: string;
  invoiceNotes: string;
  invoiceDate: string;
  lines: InvoiceLine[];
}

function loadInvoiceDraft(): Partial<InvoiceDraft> {
  try {
    const stored = localStorage.getItem(INVOICE_DRAFT_STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Partial<InvoiceDraft>;
  } catch {
    return {};
  }
}

export default function OfflineInvoiceGenerator() {
  const [initialDraft] = useState(loadInvoiceDraft);
  const [productSearch, setProductSearch] = useState(initialDraft.productSearch ?? '');
  const [customerName, setCustomerName] = useState(initialDraft.customerName ?? '');
  const [customerEmail, setCustomerEmail] = useState(initialDraft.customerEmail ?? '');
  const [customerPhone, setCustomerPhone] = useState(initialDraft.customerPhone ?? '');
  const [shippingAddress, setShippingAddress] = useState(initialDraft.shippingAddress ?? '');
  const [shippingOption, setShippingOption] = useState<'India' | 'International' | 'custom' | 'none'>(
    initialDraft.shippingOption ?? 'India',
  );
  const [customShipping, setCustomShipping] = useState(initialDraft.customShipping ?? '');
  const [invoiceNotes, setInvoiceNotes] = useState(initialDraft.invoiceNotes ?? '');
  const [invoiceDate, setInvoiceDate] = useState(
    initialDraft.invoiceDate ?? new Date().toISOString().slice(0, 10),
  );
  const [lines, setLines] = useState<InvoiceLine[]>(initialDraft.lines ?? []);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const { data, isLoading } = useProducts(undefined, productSearch);

  const products = useMemo(
    () => data?.pages.flatMap(page => page.products) ?? [],
    [data],
  );
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
  const customShippingAmount = Number(customShipping);
  const shipping = shippingOption === 'India'
    ? INDIA_SHIPPING
    : shippingOption === 'International'
      ? INTERNATIONAL_SHIPPING
      : shippingOption === 'custom' && Number.isFinite(customShippingAmount)
        ? Math.max(0, customShippingAmount)
        : 0;
  const gst = (subtotal + shipping) * GST_RATE;
  const total = subtotal + shipping + gst;

  useEffect(() => {
    try {
      const draft: InvoiceDraft = {
        productSearch,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingOption,
        customShipping,
        invoiceNotes,
        invoiceDate,
        lines,
      };
      localStorage.setItem(INVOICE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      toast({
        title: 'Draft could not be saved',
        description: 'Your browser storage may be unavailable. Keep this tab open until the invoice is saved.',
        variant: 'destructive',
      });
    }
  }, [productSearch, customerName, customerEmail, customerPhone, shippingAddress, shippingOption, customShipping, invoiceNotes, invoiceDate, lines, toast]);

  const addProduct = (product: Product) => {
    setLines(current => {
      const existing = current.find(line => line.product.id === product.id);
      if (existing) {
        return current.map(line => line.product.id === product.id
          ? { ...line, quantity: line.quantity + 1 }
          : line);
      }
      return [...current, {
        id: crypto.randomUUID(),
        product,
        quantity: 1,
        price: product.price,
      }];
    });
  };

  const updateLine = (id: string, field: 'quantity' | 'price', value: number) => {
    setLines(current => current.map(line => line.id === id ? {
      ...line,
      [field]: field === 'quantity'
        ? Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1
        : Number.isFinite(value) ? Math.max(0, value) : 0,
    } : line));
  };

  const generateInvoice = async () => {
    if (!customerName.trim() || lines.length === 0) {
      toast({
        title: 'Complete the invoice details',
        description: 'Add a customer name and at least one product.',
        variant: 'destructive',
      });
      return;
    }
    if (
      shippingOption === 'custom'
      && (!customShipping.trim() || !Number.isFinite(customShippingAmount) || customShippingAmount < 0)
    ) {
      toast({
        title: 'Enter a valid shipping fee',
        description: 'Custom shipping must be a non-negative amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const orderId = crypto.randomUUID();
    const orderNumber = `OFFLINE-${invoiceDate.replace(/-/g, '')}-${orderId.slice(0, 6).toUpperCase()}`;
    const createdAt = new Date(`${invoiceDate}T12:00:00`).toISOString();

    try {
      const { error: orderError } = await supabase.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        user_id: null,
        guest_name: customerName.trim(),
        guest_email: customerEmail.trim() || null,
        guest_phone: customerPhone.trim() || null,
        total_amount: total,
        subtotal_amount: subtotal,
        shipping_amount: shipping,
        gst_amount: gst,
        shipping_address: shippingAddress || null,
        special_requirements: invoiceNotes.trim() || null,
        status: 'delivered',
        order_source: 'offline',
        created_at: createdAt,
      });
      if (orderError) throw orderError;

      const { error: itemError } = await supabase.from('order_items').insert(
        lines.map(line => ({
          order_id: orderId,
          product_id: line.product.id,
          quantity: line.quantity,
          price_at_time: line.price,
        })),
      );
      if (itemError) {
        await supabase.from('orders').delete().eq('id', orderId);
        throw itemError;
      }

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      openInvoiceInNewTab({
        id: orderId,
        order_number: orderNumber,
        created_at: createdAt,
        total_amount: total,
        subtotal_amount: subtotal,
        shipping_amount: shipping,
        gst_amount: gst,
        status: 'delivered',
        shipping_address: shippingAddress || null,
        guest_phone: customerPhone.trim() || null,
        special_requirements: invoiceNotes.trim() || null,
        user: {
          full_name: customerName.trim(),
          email: customerEmail.trim() || undefined,
          phone: customerPhone.trim() || undefined,
        },
        order_items: lines.map(line => ({
          id: line.id,
          quantity: line.quantity,
          price_at_time: line.price,
          product: { name: line.product.name },
        })),
      });
      localStorage.removeItem(INVOICE_DRAFT_STORAGE_KEY);
      setProductSearch('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setShippingAddress('');
      setShippingOption('India');
      setCustomShipping('');
      setInvoiceNotes('');
      setInvoiceDate(new Date().toISOString().slice(0, 10));
      setLines([]);
      toast({ title: 'Invoice saved', description: 'The invoice is now available in Orders and revenue summaries.' });
    } catch (error) {
      toast({
        title: 'Invoice could not be saved',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Offline Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="offline-customer-name">Customer name</Label>
              <Input id="offline-customer-name" value={customerName} onChange={event => setCustomerName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offline-customer-email">Customer email (optional)</Label>
              <Input id="offline-customer-email" type="email" value={customerEmail} onChange={event => setCustomerEmail(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offline-customer-phone">Contact number</Label>
              <Input id="offline-customer-phone" type="tel" inputMode="tel" placeholder="+91 98765 43210" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="offline-invoice-date">Invoice date</Label>
              <Input id="offline-invoice-date" type="date" value={invoiceDate} onChange={event => setInvoiceDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shipping</Label>
              <Select value={shippingOption} onValueChange={(value: 'India' | 'International' | 'custom' | 'none') => setShippingOption(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India (₹100 shipping)</SelectItem>
                  <SelectItem value="International">International (₹500 shipping)</SelectItem>
                  <SelectItem value="custom">Custom shipping fee</SelectItem>
                  <SelectItem value="none">No shipping fee (₹0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {shippingOption === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="offline-custom-shipping">Custom shipping fee (₹)</Label>
              <Input id="offline-custom-shipping" type="number" min={0} step="0.01" placeholder="0.00" value={customShipping} onChange={event => setCustomShipping(event.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="offline-shipping-address">Billing/shipping address</Label>
            <Textarea id="offline-shipping-address" value={shippingAddress} onChange={event => setShippingAddress(event.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offline-invoice-notes">Invoice notes (optional)</Label>
            <Textarea id="offline-invoice-notes" placeholder="Add delivery instructions, payment notes, or a thank-you message" value={invoiceNotes} onChange={event => setInvoiceNotes(event.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offline-product-search">Add products</Label>
            <Input
              id="offline-product-search"
              placeholder="Search by product name, category, or SKU"
              value={productSearch}
              onChange={event => setProductSearch(event.target.value)}
            />
            {productSearch && (
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {isLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">Searching products...</p>
                ) : products.length > 0 ? products.slice(0, 8).map(product => (
                  <button
                    key={product.id}
                    type="button"
                    className="flex w-full items-center justify-between border-b p-3 text-left text-sm last:border-0 hover:bg-muted"
                    onClick={() => { addProduct(product); setProductSearch(''); }}
                  >
                    <span>{product.name}</span>
                    <span className="text-muted-foreground">₹{product.price.toFixed(2)}</span>
                  </button>
                )) : (
                  <p className="p-3 text-sm text-muted-foreground">No products found.</p>
                )}
              </div>
            )}
          </div>

          {lines.length > 0 && (
            <div className="space-y-3">
              <Label>Invoice items</Label>
              {lines.map(line => (
                <div key={line.id} className="grid grid-cols-[1fr_80px_100px_auto] items-center gap-2">
                  <span className="truncate text-sm">{line.product.name}</span>
                  <Input type="number" min={1} value={line.quantity} aria-label={`${line.product.name} quantity`} onChange={event => updateLine(line.id, 'quantity', Number(event.target.value))} />
                  <Input type="number" min={0} step="0.01" value={line.price} aria-label={`${line.product.name} price`} onChange={event => updateLine(line.id, 'price', Number(event.target.value))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setLines(current => current.filter(item => item.id !== line.id))} aria-label={`Remove ${line.product.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader><CardTitle>Invoice total</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
          <div className="flex justify-between border-t pt-3 font-semibold"><span>Grand total</span><span>₹{total.toFixed(2)}</span></div>
          <p className="text-xs text-muted-foreground">Shipping charges are exclusive and are not included in product prices. This invoice is for offline sales and will not create an online order or change inventory.</p>
          <Button className="w-full" onClick={generateInvoice} disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving invoice...' : 'Save & Generate Invoice'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              localStorage.removeItem(INVOICE_DRAFT_STORAGE_KEY);
              setProductSearch('');
              setCustomerName('');
              setCustomerEmail('');
              setCustomerPhone('');
              setShippingAddress('');
              setShippingOption('India');
              setCustomShipping('');
              setInvoiceNotes('');
              setInvoiceDate(new Date().toISOString().slice(0, 10));
              setLines([]);
            }}
            disabled={isSaving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
