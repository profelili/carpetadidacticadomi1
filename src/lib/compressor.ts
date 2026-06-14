/**
 * Compresses an image data URL on the client-side using an HTML5 Canvas element.
 * Drops the resolution to a high-density standard web format (maximum of maxDim px width or height)
 * and exports as a compressed JPEG to optimize memory, storage, and file downloads.
 */
export function compressImageDataUrl(dataUrl: string, maxDim = 720, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    // If it's not an image (or is a tiny SVG/gif/etc.), or doesn't look like dataUrl, return as is
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    // Skip small images (already tiny)
    if (dataUrl.length < 50 * 1024) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Only resize if wider or higher than maxDim
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Fill background as white (in case of transparent PNG/WebP to JPEG conversion)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw active image
      ctx.drawImage(img, 0, 0, width, height);

      try {
        // Output as highly optimized JPEG data-url
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (err) {
        console.error('Canvas export error, falling back to original dataurl:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
