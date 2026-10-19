// Loaded only by the browser tests to exercise explicit themeRoot/style integration.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ImageCropperDialog } from '../src';

function Fixture({ themeRoot }: { themeRoot: HTMLElement }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Open themed fixture</button><ImageCropperDialog
    open={open} onOpenChange={setOpen} src="/sample.jpg" output={{ width: 512, height: 512 }}
    themeRoot={themeRoot} style={{ '--ic-accent': 'var(--team-brand)', '--ic-font-size': '21px' }} onCrop={() => {}}
  /></>;
}

export function mountThemeFixture() {
  const themeRoot = document.createElement('div');
  themeRoot.id = 'external-theme';
  themeRoot.dataset.theme = 'dark';
  themeRoot.style.cssText = '--background: #112233; --foreground: #f0f5ff; --primary: #ff6600; --team-brand: #117755; font-family: Courier New, monospace;';
  const mount = document.createElement('div');
  document.body.append(themeRoot, mount);
  createRoot(mount).render(<Fixture themeRoot={themeRoot} />);
}
