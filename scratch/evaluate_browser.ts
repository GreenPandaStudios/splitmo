import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR UNHANDLED:', err));
  page.on('requestfailed', req => console.log('FAILED REQ:', req.url(), req.failure()?.errorText));

  await page.goto('https://greenpandastudios.github.io/splitmo/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const debugInfo = await page.evaluate(() => {
    return {
      title: document.title,
      reactRoot: Boolean(document.getElementById('root')?.children.length),
      localStorage: Object.keys(localStorage).map(k => ({ key: k, val: localStorage.getItem(k) })),
    };
  });

  console.log("=== DEBUG INFO ===");
  console.log(JSON.stringify(debugInfo, null, 2));

  await browser.close();
}

main();
