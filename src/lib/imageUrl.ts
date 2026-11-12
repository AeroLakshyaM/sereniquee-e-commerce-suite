const STORAGE_IMAGE_PATH = '/storage/v1/object/public/';
const RENDER_IMAGE_PATH = '/storage/v1/render/image/public/';

export const DEFAULT_IMAGE_WIDTHS = [320, 480, 720, 960] as const;

/**
 * Converts a Supabase public storage URL into a resized WebP image-transform URL.
 * Returns null for non-Supabase or relative URLs so callers keep the original src.
 */
export function getOptimizedStorageImageUrl(
  source: string,
  width: number,
  quality = 76,
): string | null {
  try {
    const url = new URL(source);
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
