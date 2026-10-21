import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types';

interface SeoHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  product?: Product;
}

const SITE_NAME = 'Sereniquee Candles';
const BASE_URL = 'https://sereniquee.com';
const DEFAULT_DESCRIPTION = 'Luxury handmade soy candles crafted with love. Discover our collection of aromatic, eco-friendly candles that transform your home into a sanctuary of warmth and relaxation.';

export function SeoHelmet({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  product,
}: SeoHelmetProps) {
  const { data: seoSettings } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('site_name, site_description, default_og_image, canonical_base_url')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const canonicalBaseUrl = (seoSettings?.canonical_base_url || BASE_URL).replace(/\/+$/, '');
  const siteName = seoSettings?.site_name || SITE_NAME;
  const finalTitle = title ? `${title} | ${siteName}` : siteName;
  const finalDescription = description || seoSettings?.site_description || DEFAULT_DESCRIPTION;
  const finalUrl = url
    ? (url.startsWith('http') ? url : `${canonicalBaseUrl}${url.startsWith('/') ? url : `/${url}`}`)
    : canonicalBaseUrl;
  const resolveAssetUrl = (asset?: string | null) =>
    asset ? (asset.startsWith('http') ? asset : `${canonicalBaseUrl}${asset.startsWith('/') ? asset : `/${asset}`}`) : undefined;
  const finalImage = resolveAssetUrl(image || seoSettings?.default_og_image) || `${canonicalBaseUrl}/landing-candles.jpg`;
  const productImages = product
    ? (product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [])
        .map(resolveAssetUrl)
        .filter((asset): asset is string => Boolean(asset))
    : [];
  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: productImages,
        description: product.description || finalDescription,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'INR',
          url: finalUrl,
          availability: product.stock_quantity > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
        ...(typeof product.average_rating === 'number' && product.average_rating > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.average_rating,
                ...(product.review_count ? { reviewCount: product.review_count } : {}),
              },
            }
          : {}),
      }
    : null;
  const breadcrumbSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalBaseUrl },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: `${canonicalBaseUrl}/shop` },
          ...(product.category
            ? [{ '@type': 'ListItem', position: 3, name: product.category }]
            : []),
          {
            '@type': 'ListItem',
            position: product.category ? 4 : 3,
            name: product.name,
            item: finalUrl,
          },
        ],
      }
    : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph Tags for Facebook/LinkedIn */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={product ? resolveAssetUrl(product.image_url) || finalImage : finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@sereniqueecandles" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content={siteName} />
      <meta name="theme-color" content="#8b5cf6" />

      {/* Schema.org markup for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: finalTitle,
          description: finalDescription,
          url: finalUrl,
          image: finalImage,
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
              '@type': 'ImageObject',
              url: `${canonicalBaseUrl}/footer-logo.png`,
            },
          },
        })}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
