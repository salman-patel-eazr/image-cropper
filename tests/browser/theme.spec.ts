import { test, expect } from '@playwright/test';

test('inherits scoped host colors, typography and radius through the body portal', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: `.app {
    --background: #faf4ff; --foreground: #221133; --primary: #6d28d9;
    --primary-foreground: #ffffff; --muted: #ede2ff; --muted-foreground: #554466;
    --border: #9988aa; --radius: 12px;
    font-family: Georgia, serif; font-size: 20px; line-height: 1.6; letter-spacing: .5px;
  }` });
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveCSS('background-color', 'rgb(250, 244, 255)');
  await expect(dialog).toHaveCSS('color', 'rgb(34, 17, 51)');
  await expect(dialog).toHaveCSS('font-family', 'Georgia, serif');
  await expect(dialog).toHaveCSS('font-size', '20px');
  await expect(dialog).toHaveCSS('border-radius', '12px');
  await expect(dialog.getByRole('button', { name: 'Save image' })).toHaveCSS('background-color', 'rgb(109, 40, 217)');
  await expect(dialog.getByRole('button', { name: 'Save image' })).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(dialog.getByRole('button', { name: 'Save image' })).toHaveCSS('font-family', 'Georgia, serif');
  expect(await dialog.evaluate(el => el.parentElement === document.body)).toBe(true);
});

test('responds to host light/dark switches and typography updates while open', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: `.app { --background: #fff; --foreground: #111; --primary: #2244aa; }
    .app.dark { --background: #172033; --foreground: #eef2ff; --primary: #99bbff; --primary-foreground: #101b30; font-family: monospace; font-size: 18px; }` });
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.locator('.app').evaluate(el => el.classList.add('dark'));
  await expect(page.getByRole('dialog')).toHaveAttribute('data-ic-theme', 'dark');
  await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(23, 32, 51)');
  await expect(page.getByRole('dialog')).toHaveCSS('color', 'rgb(238, 242, 255)');
  await expect(page.getByRole('dialog')).toHaveCSS('font-family', 'monospace');
  await expect(page.getByRole('dialog')).toHaveCSS('font-size', '18px');
  await page.locator('.app').evaluate(el => el.classList.remove('dark'));
  await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('supports legacy HSL design tokens without changing host variables', async ({ page }) => {
  await page.goto('/');
  await page.locator('.app').evaluate(el => {
    (el as HTMLElement).style.setProperty('--primary', '270 100% 40%');
    (el as HTMLElement).style.setProperty('--background', '0 0% 100%');
    (el as HTMLElement).style.setProperty('--foreground', '0 0% 10%');
  });
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save image' })).toHaveCSS('background-color', 'rgb(102, 0, 204)');
  expect(await page.locator('.app').evaluate(el => getComputedStyle(el).getPropertyValue('--primary').trim())).toBe('270 100% 40%');
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--ic-bg'))).toBe('');
});

test('uses the parent computed font and colors when no semantic tokens exist', async ({ page }) => {
  await page.goto('/');
  await page.locator('.app').evaluate(el => {
    Object.assign((el as HTMLElement).style, { backgroundColor: 'rgb(240, 250, 245)', color: 'rgb(20, 60, 40)', fontFamily: 'Verdana, sans-serif', fontSize: '19px' });
  });
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(240, 250, 245)');
  await expect(page.getByRole('dialog')).toHaveCSS('color', 'rgb(20, 60, 40)');
  await expect(page.getByRole('dialog')).toHaveCSS('font-family', 'Verdana, sans-serif');
  await expect(page.getByRole('dialog')).toHaveCSS('font-size', '19px');
});

test('skips fully transparent colored backgrounds when finding the host surface', async ({ page }) => {
  await page.goto('/');
  await page.locator('.app').evaluate(el => {
    const wrapper = document.createElement('section');
    wrapper.style.backgroundColor = '#e0f0e8';
    el.parentElement!.insertBefore(wrapper, el);
    wrapper.append(el);
    (el as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0)';
  });
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(224, 240, 232)');
});

test('public cropper CSS overrides win over host tokens and live updates are preserved', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: `.app { --primary: #225588; }
    .ic-dialog { --ic-accent: #a11255; --ic-font-family: Georgia, serif; }` });
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save image' })).toHaveCSS('background-color', 'rgb(161, 18, 85)');
  await expect(page.getByRole('dialog')).toHaveCSS('font-family', 'Georgia, serif');
  await page.locator('.app').evaluate(el => (el as HTMLElement).style.setProperty('--primary', '#ff0000'));
  await expect(page.getByRole('button', { name: 'Save image' })).toHaveCSS('background-color', 'rgb(161, 18, 85)');
});

test('explicit dark mode remains available when the host has no color tokens', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Editor preferences', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'Dark editor' }).check();
  await page.getByRole('button', { name: 'Open cropper', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('data-ic-theme', 'dark');
  await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(32, 32, 32)');
});

test('explicit themeRoot and style overrides work with custom variables across the portal', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    // @ts-expect-error Vite resolves this test-only React fixture in the browser.
    const { mountThemeFixture } = await import('/demo/theme-fixture.tsx');
    mountThemeFixture();
  });
  await page.getByRole('button', { name: 'Open themed fixture' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAttribute('data-ic-theme', 'dark');
  await expect(dialog).toHaveCSS('background-color', 'rgb(17, 34, 51)');
  await expect(dialog).toHaveCSS('font-family', '"Courier New", monospace');
  await expect(dialog).toHaveCSS('font-size', '21px');
  await expect(dialog.getByRole('button', { name: 'Save image' })).toHaveCSS('background-color', 'rgb(17, 119, 85)');
  await page.locator('#external-theme').evaluate(el => (el as HTMLElement).style.setProperty('--team-brand', '#2255bb'));
  await expect(dialog.getByRole('button', { name: 'Save image' })).toHaveCSS('background-color', 'rgb(34, 85, 187)');
});
