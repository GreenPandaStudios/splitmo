import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log("Navigating to http://localhost:4173/ ...");
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log("=== RENDERED LOCAL PREVIEW PAGE TEXT ===");
  console.log(text);

  await page.screenshot({ path: '/Users/august/.gemini/antigravity/brain/6ff1a172-735d-4b64-968f-8d93ffa986e9/live_app_screenshot.png', fullPage: true });

  await browser.close();
}

main();
