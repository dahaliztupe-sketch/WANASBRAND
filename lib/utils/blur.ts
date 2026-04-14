/**
 * Utility to generate blur placeholders for images.
 * In a production environment, this would use 'plaiceholder' or a similar library
 * to generate a unique blurDataURL for each image.
 */

export async function getBlurData(_imageUrl: string): Promise<string> {
  // Static high-quality placeholder for luxury aesthetic
  // This is a base64 encoded 1x1 pixel that represents the brand's primary neutral tone
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
}
