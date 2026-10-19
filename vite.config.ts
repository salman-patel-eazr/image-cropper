import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: {
    copyPublicDir: false,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'image-cropper', cssFileName: 'image-cropper' },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@radix-ui\//, /^motion($|\/)/, /^lucide-react$/, /^react-easy-crop$/],
      output: { banner: '"use client";' },
      onwarn(warning, warn) { if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning); }
    }
  }
});
