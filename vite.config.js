import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tiny Town is a static, single-page game. We keep a relative base so the
// built `dist/` can be dropped onto any host (subpath or root) and just work.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2018',
    assetsInlineLimit: 4096, // keep the webp sprites as separate, cacheable files
    chunkSizeWarningLimit: 1200,
  },
});
