export interface SitemapProductRow {
  slug: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface SitemapBlogRow {
  slug: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: string;
}

const DEFAULT_BASE_URL = 'https://www.sereniqueecandles.com';

export const STATIC_SITEMAP_ROUTES: ReadonlyArray<{
  path: string;
  changefreq: SitemapUrlEntry['changefreq'];
  priority: string;
}> = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/blogs', changefreq: 'weekly', priority: '0.8' },
  { path: '/gallery', changefreq: 'weekly', priority: '0.8' },
  { path: '/custom-orders', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/shipping-returns', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.5' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.5' },
  { path: '/mobile-store', changefreq: 'weekly', priority: '0.7' },
  { path: '/mobile-store/shop', changefreq: 'weekly', priority: '0.7' },
];

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastMod(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function normalizeBaseUrl(rawBaseUrl?: string | null): string {
  const candidate = (rawBaseUrl || '').trim().replace(/\/+$/, '');
  if (!candidate) return DEFAULT_BASE_URL;
  try {
    const parsed = new URL(candidate);
    return parsed.origin;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

export function buildSitemapXml(params: {
  baseUrl?: string | null;
  products?: SitemapProductRow[];
  blogs?: SitemapBlogRow[];
}): string {
  const baseUrl = normalizeBaseUrl(params.baseUrl);
  const entries: SitemapUrlEntry[] = STATIC_SITEMAP_ROUTES.map((route) => ({
    loc: `${baseUrl}${route.path}`,
    changefreq: route.changefreq,
    priority: route.priority,
  }));

  const seenLocs = new Set(entries.map((entry) => entry.loc));

  for (const product of params.products ?? []) {
    const slug = (product.slug || '').trim();
    if (!slug) continue;
    const loc = `${baseUrl}/product/${encodeURIComponent(slug)}`;
    if (seenLocs.has(loc)) continue;
    seenLocs.add(loc);
    entries.push({
      loc,
      lastmod: formatLastMod(product.updated_at || product.created_at),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const blog of params.blogs ?? []) {
    const slug = (blog.slug || '').trim();
    if (!slug) continue;
    const loc = `${baseUrl}/blogs/${encodeURIComponent(slug)}`;
    if (seenLocs.has(loc)) continue;
    seenLocs.add(loc);
    entries.push({
      loc,
      lastmod: formatLastMod(blog.updated_at || blog.published_at || blog.created_at),
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  const urlBlocks = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlBlocks}\n</urlset>\n`;
}
