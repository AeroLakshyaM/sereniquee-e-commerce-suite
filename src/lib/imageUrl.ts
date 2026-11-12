const STORAGE_IMAGE_PATH = '/storage/v1/object/public/';
const RENDER_IMAGE_PATH = '/storage/v1/render/image/public/';
const CLOUDINARY_UPLOAD_PATH = '/image/upload/';

export const DEFAULT_IMAGE_WIDTHS = [320, 480, 720, 960] as const;

/**
 * Converts a Supabase public storage URL or Cloudinary delivery URL into a resized,
 * format-optimized image URL. Returns null for unsupported or relative URLs so callers
 * keep the original src.
 */
export function getOptimizedStorageImageUrl(
  source: string,
  width: number,
  quality = 76,
): string | null {
  try {
    const url = new URL(source);

    if (url.hostname === 'res.cloudinary.com' && url.pathname.includes(CLOUDINARY_UPLOAD_PATH)) {
      const [, rest] = url.pathname.split(CLOUDINARY_UPLOAD_PATH);
      if (!rest) return null;
      const firstSegment = rest.split('/')[0] ?? '';
      const hasTransform = /^(?:f_|q_|w_|c_|h_)/.test(firstSegment) || firstSegment.includes(',');
      if (!hasTransform) {
        url.pathname = url.pathname.replace(
          CLOUDINARY_UPLOAD_PATH,
          `${CLOUDINARY_UPLOAD_PATH}f_auto,q_auto,w_${width},c_limit/`,
        );
      }
      return url.toString();
    }

    if (!url.pathname.includes(STORAGE_IMAGE_PATH)) return null;
    url.pathname = url.pathname.replace(STORAGE_IMAGE_PATH, RENDER_IMAGE_PATH);
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', String(quality));
    url.searchParams.set('format', 'webp');
    return url.toString();
  } catch {
    return null;
  }
}

export function getStorageImageSrcSet(
  source: string,
  widths: readonly number[] = DEFAULT_IMAGE_WIDTHS,
  quality = 76,
): string | undefined {
  if (!getOptimizedStorageImageUrl(source, widths[0] ?? 320, quality)) return undefined;
  return widths
    .map((width) => `${getOptimizedStorageImageUrl(source, width, quality)} ${width}w`)
    .join(', ');
}
