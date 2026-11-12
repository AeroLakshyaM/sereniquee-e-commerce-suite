import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSitemapXml } from '../../api/_lib/sitemapXml';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mocks.from,
  }),
}));

describe('buildSitemapXml', () => {
  it('includes static routes, products, and blogs with XML escaping and canonical base URL', () => {
    const xml = buildSitemapXml({
      baseUrl: 'https://sereniqueecandles.com///',
      products: [
        { slug: 'lavender & rose', updated_at: '2026-11-10T10:00:00Z' },
        { slug: '  ' },
        { slug: null },
      ],
      blogs: [
        { slug: 'candle-care-guide', published_at: '2026-11-01T08:00:00Z' },
      ],
    });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<loc>https://sereniqueecandles.com/</loc>');
    expect(xml).toContain('<loc>https://sereniqueecandles.com/shop</loc>');
    expect(xml).toContain('<loc>https://sereniqueecandles.com/product/lavender%20%26%20rose</loc>');
    expect(xml).toContain('<lastmod>2026-11-10T10:00:00.000Z</lastmod>');
    expect(xml).toContain('<loc>https://sereniqueecandles.com/blogs/candle-care-guide</loc>');
  });
});

describe('/api/sitemap handler', () => {
  const originalUrl = process.env.VITE_SUPABASE_URL;
  const originalKey = process.env.VITE_SUPABASE_ANON_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.VITE_SUPABASE_URL;
    else process.env.VITE_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.VITE_SUPABASE_ANON_KEY;
    else process.env.VITE_SUPABASE_ANON_KEY = originalKey;
  });

  it('rejects non-GET/HEAD requests with 405', async () => {
    const { default: handler } = await import('../../api/sitemap');
    const json = vi.fn();
    const res = {
      setHeader: vi.fn(),
      status: vi.fn(() => ({ json })),
    };

    await handler({ method: 'POST' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('returns cached XML fallback when Supabase env vars are missing', async () => {
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const { default: handler } = await import('../../api/sitemap');
    const send = vi.fn();
    const setHeader = vi.fn();
    const res = {
      setHeader,
      status: vi.fn(() => ({ send })),
    };

    await handler({ method: 'GET' }, res);
    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(send.mock.calls[0][0]).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it('queries seo_settings, products, and published blogs when configured', async () => {
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-key';

    mocks.from.mockImplementation((table: string) => {
      if (table === 'seo_settings') {
        return {
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: { canonical_base_url: 'https://www.sereniqueecandles.com' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'products') {
        return {
          select: () => ({
            order: async () => ({
              data: [{ slug: 'vanilla-oud', updated_at: '2026-11-12T00:00:00Z' }],
              error: null,
            }),
          }),
        };
      }
      if (table === 'blogs') {
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({
                data: [{ slug: 'soy-wax-benefits', published_at: '2026-11-11T00:00:00Z' }],
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const { default: handler } = await import('../../api/sitemap');
    const send = vi.fn();
    const res = {
      setHeader: vi.fn(),
      status: vi.fn(() => ({ send })),
    };

    await handler({ method: 'GET' }, res);
    const body = send.mock.calls[0][0] as string;
    expect(res.status).toHaveBeenCalledWith(200);
    expect(body).toContain('<loc>https://www.sereniqueecandles.com/product/vanilla-oud</loc>');
    expect(body).toContain('<loc>https://www.sereniqueecandles.com/blogs/soy-wax-benefits</loc>');
  });
});
