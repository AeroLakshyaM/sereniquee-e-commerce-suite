import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { reportApiError } from './_lib/reportError.js';
import { buildSitemapXml, SitemapBlogRow, SitemapProductRow } from './_lib/sitemapXml.js';

interface SitemapRequest {
  method?: string;
}

interface SitemapResponse {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => {
    send?: (body: string) => void;
    end?: (body?: string) => void;
    json?: (payload: unknown) => void;
  };
}

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

function sendXml(res: SitemapResponse, xml: string) {
  res.setHeader?.('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader?.('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  const writer = res.status(200);
  if (writer.send) {
    writer.send(xml);
    return;
  }
  writer.end?.(xml);
}

export default async function handler(req: SitemapRequest, res: SitemapResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const writer = res.status(405);
    if (writer.json) {
      writer.json({ error: 'Method not allowed' });
    } else {
      writer.end?.('Method not allowed');
    }
    return;
  }

  const supabase = getPublicClient();
  if (!supabase) {
    sendXml(res, buildSitemapXml({}));
    return;
  }

  try {
    const [seoResult, productsResult, blogsResult] = await Promise.all([
      supabase
        .from('seo_settings')
        .select('canonical_base_url')
        .limit(1)
        .maybeSingle(),
      supabase
        .from('products')
        .select('slug, updated_at, created_at')
        .order('updated_at', { ascending: false }),
      supabase
        .from('blogs')
        .select('slug, updated_at, published_at, created_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
    ]);

    if (seoResult.error) reportApiError('sitemap_seo_settings_failed', seoResult.error);
    if (productsResult.error) reportApiError('sitemap_products_failed', productsResult.error);
    if (blogsResult.error) reportApiError('sitemap_blogs_failed', blogsResult.error);

    const xml = buildSitemapXml({
      baseUrl: seoResult.data?.canonical_base_url,
      products: (productsResult.data ?? []) as SitemapProductRow[],
      blogs: (blogsResult.data ?? []) as SitemapBlogRow[],
    });

    sendXml(res, xml);
  } catch (error) {
    reportApiError('sitemap_generation_failed', error);
    sendXml(res, buildSitemapXml({}));
  }
}
