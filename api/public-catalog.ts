import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { reportApiError } from './_lib/reportError.js';

interface CatalogRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface CatalogResponse {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => { json: (payload: unknown) => void };
}

const PRODUCTS_PAGE_SIZE = 12;
const PRODUCT_LISTING_FIELDS = 'id,name,slug,sku,description,price,category,stock_quantity,image_url,image_urls,featured,created_at,updated_at';
const BLOG_LISTING_FIELDS = 'id,title,slug,excerpt,content,cover_image_url,author_name,is_published,tags,reading_time,published_at,created_at,updated_at';

let cachedAnonClient: SupabaseClient | null = null;
let cachedConfigKey = '';

function getPublicClient(): SupabaseClient | null {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) return null;
  const configKey = `${supabaseUrl}::${anonKey}`;
  if (!cachedAnonClient || cachedConfigKey !== configKey) {
    cachedAnonClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    cachedConfigKey = configKey;
  }
  return cachedAnonClient;
}

function readParam(query: CatalogRequest['query'], key: string): string {
  const raw = query?.[key];
  if (Array.isArray(raw)) return raw[0] ?? '';
  return typeof raw === 'string' ? raw : '';
}

function escapeSearchTerm(term: string) {
  return term.replace(/([\\(),])/g, '\\$1');
}

export default async function handler(req: CatalogRequest, res: CatalogResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getPublicClient();
  if (!supabase) return res.status(503).json({ error: 'Public catalog service is not configured.' });

  const resource = readParam(req.query, 'resource');
  res.setHeader?.('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  try {
    if (resource === 'products') {
      const pageRaw = Number.parseInt(readParam(req.query, 'page') || '0', 10);
      const page = Number.isInteger(pageRaw) && pageRaw >= 0 && pageRaw <= 200 ? pageRaw : 0;
      const category = readParam(req.query, 'category').trim();
      const searchQuery = readParam(req.query, 'search').trim().slice(0, 120);
      const includeMetadata = readParam(req.query, 'scentMetadata') === '1';

      let query = supabase
        .from('products')
        .select(`${PRODUCT_LISTING_FIELDS}${includeMetadata ? ',metadata' : ''}`)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      if (keywords.length > 0) {
        const searchFilters = keywords
          .map((keyword) => {
            const term = escapeSearchTerm(keyword);
            return `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,sku.ilike.%${term}%`;
          })
          .join(',');
        query = query.or(searchFilters);
      }

      const from = page * PRODUCTS_PAGE_SIZE;
      const to = from + PRODUCTS_PAGE_SIZE - 1;
      const { data, error } = await query.range(from, to);
      if (error) throw error;

      return res.status(200).json({ products: data || [], nextPage: page + 1 });
    }

    if (resource === 'featured-products') {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_LISTING_FIELDS)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return res.status(200).json({ products: data || [] });
    }

    if (resource === 'categories') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ categories: data || [] });
    }

    if (resource === 'blogs') {
      const limitRaw = Number.parseInt(readParam(req.query, 'limit') || '0', 10);
      const tag = readParam(req.query, 'tag').trim().slice(0, 80);

      let query = supabase
        .from('blogs')
        .select(BLOG_LISTING_FIELDS)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (tag) query = query.contains('tags', [tag]);
      if (Number.isInteger(limitRaw) && limitRaw > 0 && limitRaw <= 100) {
        query = query.limit(limitRaw);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ blogs: data || [] });
    }

    return res.status(400).json({ error: 'Invalid catalog resource.' });
  } catch (error) {
    const incidentId = reportApiError('public_catalog_fetch_failed', error);
    return res.status(500).json({ error: 'Could not load catalog data.', incidentId });
  }
}
