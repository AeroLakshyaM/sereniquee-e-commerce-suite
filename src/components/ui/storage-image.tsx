import { ImgHTMLAttributes, useState } from 'react';
import {
  DEFAULT_IMAGE_WIDTHS,
  getOptimizedStorageImageUrl,
  getStorageImageSrcSet,
  markTransformHostUnsupported,
} from '@/lib/imageUrl';

interface StorageImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  widths?: readonly number[];
  defaultWidth?: number;
  quality?: number;
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Renders a responsive WebP Supabase Storage image when supported and automatically
 * falls back to the original object URL if image transformations are unavailable.
 */
export function StorageImage({
  src,
  widths = DEFAULT_IMAGE_WIDTHS,
  defaultWidth = 640,
  quality = 76,
  sizes,
  onError,
  fetchPriority,
  ...imgProps
}: StorageImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const useOriginal = src === failedSrc;
  const optimizedSrc = getOptimizedStorageImageUrl(src, defaultWidth, quality);
  const srcSet = useOriginal ? undefined : getStorageImageSrcSet(src, widths, quality);

  return (
    <img
      {...imgProps}
      {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
      src={useOriginal ? src : optimizedSrc || src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      onError={(event) => {
        if (!useOriginal && optimizedSrc) {
          markTransformHostUnsupported(src);
          setFailedSrc(src);
        }
        onError?.(event);
      }}
    />
  );
}
