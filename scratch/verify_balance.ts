import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', msg => console.log('PAGE:', msg.text()));

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check the balance text
  const balanceText = await page.locator('text=/\\+\\$[0-9,]+/').first().textContent();
  console.log('\n=== BALANCE SHOWN ===');
  console.log(balanceText);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const has90k = bodyText.includes('90,000') || bodyText.includes('91,697') || bodyText.includes('90000');
  const has1019 = bodyText.includes('1,019') || bodyText.includes('1019');
  console.log('Contains $90k bug?', has90k);
  console.log('Contains correct ~$1019?', has1019);

  await page.screenshot({ path: '/Users/august/.gemini/antigravity/brain/6ff1a172-735d-4b64-968f-8d93ffa986e9/local_preview.png' });
  await browser.close();

  if (has90k) {
    console.error('\n❌ FAIL: Still showing $90k!');
    process.exit(1);
  }
  console.log('\n✅ PASS: Correct balance displayed');
}

main();
