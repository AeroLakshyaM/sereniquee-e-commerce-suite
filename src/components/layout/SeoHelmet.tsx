import { Helmet } from 'react-helmet-async';

interface SeoHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
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
}: SeoHelmetProps) {
  const finalTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const finalImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : `${BASE_URL}/og-default.png`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph Tags for Facebook/LinkedIn */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@sereniquee" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content={SITE_NAME} />
      <meta name="theme-color" content="#8b5cf6" />

      {/* Schema.org markup for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'product' ? 'Product' : type === 'article' ? 'Article' : 'WebSite',
          name: finalTitle,
          description: finalDescription,
          url: finalUrl,
          image: finalImage,
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
              '@type': 'ImageObject',
              url: `${BASE_URL}/logo.png`,
            },
          },
        })}
      </script>
    </Helmet>
  );
}
