import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.CROPPER_EXAMPLE_URL ?? 'http://127.0.0.1:4317', { waitUntil: 'domcontentloaded' });
  console.log('Next.js page loaded.');
  await page.getByRole('button', { name: 'Toggle host theme' }).click();
  await page.locator('input[type=file]').setInputFiles('public/sample.jpg');
  console.log('Source selected.');
  await page.locator('[role="dialog"][data-ic-theme="dark"]').waitFor();
  await page.getByRole('button', { name: 'Save image' }).click();
  await page.getByRole('status').filter({ hasText: 'Exported 1300 × 700:' }).waitFor();
  assert.deepEqual(errors, []);
  console.log('Next.js production upload → crop → PNG export passed; no browser errors.');
} finally { await browser.close(); }
