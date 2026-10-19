import type { CropArea, CropResult, OutputOptions } from './types';

export function validateOptions(output: OutputOptions, aspectRatio?: number): number {
  for (const n of [output.width, output.height]) {
    if (!Number.isInteger(n) || n < 1 || n > 8192) throw new Error('Output dimensions must be integers between 1 and 8192 pixels.');
  }
  if (output.width * output.height > 32_000_000) throw new Error('Output must be no larger than 32 megapixels.');
  const ratio = output.width / output.height;
  if (aspectRatio !== undefined && (!Number.isFinite(aspectRatio) || aspectRatio <= 0 || Math.abs(aspectRatio - ratio) / ratio > 0.001)) {
    throw new Error('Aspect ratio must match the output width and height.');
  }
  if (output.type && !['image/jpeg', 'image/png', 'image/webp'].includes(output.type)) throw new Error('Unsupported output format.');
  if (output.quality !== undefined && (!Number.isFinite(output.quality) || output.quality < 0 || output.quality > 1)) throw new Error('Quality must be between 0 and 1.');
  if (output.maxBytes !== undefined && (!Number.isSafeInteger(output.maxBytes) || output.maxBytes < 1)) throw new Error('File-size limit must be a positive integer in bytes.');
  return aspectRatio ?? ratio;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load this image. Use a supported image file or a URL that allows CORS.'));
    image.src = src;
  });
}

export async function exportCrop(src: string, crop: CropArea, rotation: number, output: OutputOptions, fileName = 'cropped-image'): Promise<CropResult> {
  validateOptions(output);
  if (![crop.x, crop.y, crop.width, crop.height, rotation].every(Number.isFinite) || crop.width <= 0 || crop.height <= 0 || crop.x < 0 || crop.y < 0) throw new Error('Invalid crop region.');
  const image = await loadImage(src);
  const radians = rotation * Math.PI / 180;
  const bounds = {
    width: Math.abs(Math.cos(radians) * image.naturalWidth) + Math.abs(Math.sin(radians) * image.naturalHeight),
    height: Math.abs(Math.sin(radians) * image.naturalWidth) + Math.abs(Math.cos(radians) * image.naturalHeight)
  };
  if (crop.x + crop.width > bounds.width + 2 || crop.y + crop.height > bounds.height + 2) throw new Error('Crop region is outside the image.');
  // Transform directly into the output canvas: no full-resolution intermediate allocation.
  const canvas = document.createElement('canvas');
  canvas.width = output.width;
  canvas.height = output.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  const type = output.type ?? 'image/jpeg';
  if (type === 'image/jpeg') { ctx.fillStyle = output.background ?? '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(output.width / crop.width, output.height / crop.height);
  ctx.translate(bounds.width / 2 - crop.x, bounds.height / 2 - crop.y);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  const encode = (quality: number) => new Promise<Blob>((resolve, reject) => {
    try { canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image encoding failed.')), type, quality); }
    catch { reject(new Error('Cannot export this image. The source server must permit cross-origin access.')); }
  });
  let blob = await encode(output.quality ?? 0.92);
  if (blob.type !== type) throw new Error(`This browser cannot export ${type}. Choose JPEG or PNG.`);
  if (output.maxBytes && blob.size > output.maxBytes) {
    if (type === 'image/png') throw new Error('PNG exceeds the file-size limit. Choose JPEG/WebP or smaller output dimensions.');
    let low = 0, high = output.quality ?? 0.92;
    let best = await encode(0);
    if (best.size > output.maxBytes) throw new Error('The image cannot fit the file-size limit at these dimensions. Increase the limit or reduce dimensions.');
    for (let i = 0; i < 8; i++) {
      const mid = (low + high) / 2;
      const candidate = await encode(mid);
      if (candidate.size <= output.maxBytes) { best = candidate; low = mid; } else high = mid;
    }
    blob = best;
  }
  const extension = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];
  const file = new File([blob], `${fileName.replace(/\.[^.]+$/, '')}.${extension}`, { type });
  return { blob, file, type, size: blob.size, width: canvas.width, height: canvas.height, crop, rotation };
}
