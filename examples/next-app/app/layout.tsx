import type { ReactNode } from 'react';
import '@organization/image-cropper/styles.css';
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body style={{ fontFamily: 'system-ui', padding: 32 }}>{children}</body></html>;
}
