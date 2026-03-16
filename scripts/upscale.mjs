import sharp from 'sharp';
import path from 'path';

/**
 * Upscale/crop a PNG to exactly 1080×1920 using Lanczos3 resampling.
 * Used by all 5 ad plans. Pass absolute paths.
 */
export async function upscale(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1080, 1920, {
      fit: 'cover',
      position: 'centre',
      kernel: 'lanczos3',
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`Upscaled → ${outputPath}`);
}

// CLI usage: node scripts/upscale.mjs <inputPath> <outputPath>
const [,, inputArg, outputArg] = process.argv;
if (inputArg && outputArg) {
  const inputPath = path.resolve(inputArg);
  const outputPath = path.resolve(outputArg);
  upscale(inputPath, outputPath).catch(err => { console.error(err); process.exit(1); });
}
