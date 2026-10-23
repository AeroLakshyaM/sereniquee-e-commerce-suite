import { supabase } from '@/integrations/supabase/client';

export type BulkProductAction = 'featured' | 'unfeatured' | 'delete';

export async function runBulkProductAction(action: BulkProductAction, productIds: string[]) {
  if (productIds.length === 0) return { error: null };

  const result = action === 'delete'
    ? await supabase.from('products').delete().in('id', productIds)
    : await supabase.from('products').update({ featured: action === 'featured' }).in('id', productIds);

  return { error: result.error };
}
