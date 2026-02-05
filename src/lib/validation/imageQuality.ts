import type { ImageQualityResult } from '@/types';

// Thresholds - start lenient per research recommendation
// These can be tuned based on real user data during beta
const BLUR_THRESHOLD = 80; // Laplacian variance < this = blurry
const MIN_BRIGHTNESS = 30; // Average pixel brightness (0-255)
const MAX_BRIGHTNESS = 250;

/**
 * Validates image quality using canvas-based analysis
 * Checks for blur (Laplacian variance) and brightness
 */
export async function validateImageQuality(
  imageDataUrl: string
): Promise<ImageQualityResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const blurScore = calculateLaplacianVariance(imageData);
        const brightness = calculateAverageBrightness(imageData);

        const issues: string[] = [];

        if (blurScore < BLUR_THRESHOLD) {
          issues.push('Image appears blurry. Try holding your phone steadier.');
        }

        if (brightness < MIN_BRIGHTNESS) {
          issues.push('Image is too dark. Try taking the photo in better lighting.');
        }

        if (brightness > MAX_BRIGHTNESS) {
          issues.push('Image is too bright. Try reducing glare or direct sunlight.');
        }

        resolve({
          isValid: issues.length === 0,
          blurScore,
          brightness,
          issues,
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for validation'));
    };

    img.src = imageDataUrl;
  });
}

/**
 * Calculates Laplacian variance as a measure of image sharpness
 * Higher values = sharper image, lower values = blurrier
 */
function calculateLaplacianVariance(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Convert to grayscale and apply Laplacian operator
  let sum = 0;
  let sumSquared = 0;
  let count = 0;

  // Skip edge pixels where kernel would go out of bounds
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // Get grayscale value for current and surrounding pixels
      const center = getGrayscale(data, idx);
      const top = getGrayscale(data, idx - width * 4);
      const bottom = getGrayscale(data, idx + width * 4);
      const left = getGrayscale(data, idx - 4);
      const right = getGrayscale(data, idx + 4);

      // Laplacian: 4 * center - (top + bottom + left + right)
      const laplacian = 4 * center - top - bottom - left - right;

      sum += laplacian;
      sumSquared += laplacian * laplacian;
      count++;
    }
  }

  if (count === 0) return 0;

  // Calculate variance
  const mean = sum / count;
  const variance = sumSquared / count - mean * mean;

  return Math.sqrt(Math.abs(variance));
}

/**
 * Calculates average brightness of the image (0-255 scale)
 */
function calculateAverageBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let sum = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    // Luminance formula: 0.299R + 0.587G + 0.114B
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    sum += 0.299 * r + 0.587 * g + 0.114 * b;
  }

  return sum / pixelCount;
}

/**
 * Converts RGB pixel at given index to grayscale value
 */
function getGrayscale(data: Uint8ClampedArray, idx: number): number {
  const r = data[idx] ?? 0;
  const g = data[idx + 1] ?? 0;
  const b = data[idx + 2] ?? 0;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Export thresholds for testing/debugging
export const IMAGE_QUALITY_THRESHOLDS = {
  BLUR_THRESHOLD,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
};
