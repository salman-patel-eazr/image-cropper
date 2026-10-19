import type { ReactNode } from 'react';
import '@organization/image-cropper/styles.css';
import './globals.css';
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
