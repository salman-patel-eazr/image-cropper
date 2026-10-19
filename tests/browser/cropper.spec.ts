import { test, expect } from '@playwright/test';

test('crop, rotate, zoom, export and download an exact-size image', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Save image' })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Reset crop' }).click();
  await expect(dialog.getByRole('button', { name: 'Save image' })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(dialog.getByRole('slider', { name: 'Zoom', exact: true })).toHaveValue('1.1');
  await dialog.getByRole('button', { name: 'Rotate clockwise 90 degrees' }).click();
  await dialog.getByRole('button', { name: 'Save image' }).click();
  await expect(page.getByText('Your image is ready')).toBeVisible();
  const size = await page.getByAltText('Your exported crop').evaluate(async (img: HTMLImageElement) => { await img.decode(); return [img.naturalWidth, img.naturalHeight]; });
  expect(size).toEqual([1920, 1080]);
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download cropped image' }).click();
  expect((await download).suggestedFilename()).toBe('cropped-image.jpg');
  expect(errors).toEqual([]);
});

test('focus is trapped and restored, Escape closes, and mobile fits', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open cropper', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Save image' })).toBeEnabled();
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.width).toBeLessThanOrEqual(390);
  expect(box!.height).toBeLessThanOrEqual(844);
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('invalid dimensions show an actionable error', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('spinbutton', { name: 'Output width', exact: true }).fill('0');
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Output dimensions');
});

test('file-size failure stays open and can be corrected', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('spinbutton', { name: 'Maximum file size in KB' }).fill('1');
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await page.getByRole('button', { name: 'Save image' }).click();
  await expect(page.getByRole('alert')).toContainText('cannot fit');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Maximum file size in KB' }).fill('300');
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await page.getByRole('button', { name: 'Save image' }).click();
  await expect(page.getByText('Your image is ready')).toBeVisible();
});

test('canvas pixels match rotated crop geometry, preserves PNG alpha and enforces byte ceiling', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    // @ts-expect-error Vite resolves source imports in the browser.
    const { exportCrop } = await import('/src/crop.ts');
    const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 200;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 200, 200); ctx.fillStyle = 'blue'; ctx.fillRect(200, 0, 200, 200);
    const source = canvas.toDataURL();
    const pixel = async (blob: Blob, x: number, y: number) => { const image = await createImageBitmap(blob); const c = document.createElement('canvas'); c.width = image.width; c.height = image.height; const context = c.getContext('2d')!; context.drawImage(image, 0, 0); image.close(); return Array.from(context.getImageData(x, y, 1, 1).data); };
    const crop = await exportCrop(source, { x: 100, y: 0, width: 200, height: 200 }, 0, { width: 100, height: 100, type: 'image/png' });
    const rotated = await exportCrop(source, { x: 0, y: 0, width: 200, height: 400 }, 90, { width: 100, height: 200, type: 'image/png' });
    ctx.clearRect(0, 0, 400, 200);
    const alpha = await exportCrop(canvas.toDataURL(), { x: 0, y: 0, width: 400, height: 200 }, 0, { width: 100, height: 50, type: 'image/png' });
    const jpeg = await exportCrop(source, { x: 0, y: 0, width: 400, height: 200 }, 0, { width: 400, height: 200, type: 'image/jpeg', maxBytes: 2000 });
    return { left: await pixel(crop.blob, 5, 50), right: await pixel(crop.blob, 95, 50), top: await pixel(rotated.blob, 50, 5), bottom: await pixel(rotated.blob, 50, 195), alpha: await pixel(alpha.blob, 1, 1), bytes: jpeg.size };
  });
  expect(result.left).toEqual([255, 0, 0, 255]); expect(result.right).toEqual([0, 0, 255, 255]);
  expect(result.top).toEqual([255, 0, 0, 255]); expect(result.bottom).toEqual([0, 0, 255, 255]);
  expect(result.alpha).toEqual([0, 0, 0, 0]); expect(result.bytes).toBeLessThanOrEqual(2000);
});

test('desktop visual review', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'test-results/playground.png', fullPage: true });
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save image' })).toBeEnabled();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'test-results/dialog.png' });
});
