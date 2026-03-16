import { chromium } from 'playwright';
import path from 'path';
import { writeFile } from 'fs/promises';

/**
 * Screenshot an HTML ad template at 1080×1920 using Playwright.
 * Used by all 5 ad plans. Pass absolute paths.
 */
export async function renderAd(htmlPath, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.goto(`file://${path.resolve(htmlPath)}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // safety buffer for Google Fonts
  const screenshot = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 1080, height: 1920 },
  });
  await writeFile(outputPath, screenshot);
  await browser.close();
  console.log(`Exported → ${outputPath}`);
}

// CLI usage: node scripts/composite.mjs <htmlPath> <outputPath>
const [,, htmlArg, outputArg] = process.argv;
if (htmlArg && outputArg) {
  const htmlPath = path.resolve(htmlArg);
  const outputPath = path.resolve(outputArg);
  renderAd(htmlPath, outputPath).catch(err => { console.error(err); process.exit(1); });
}
