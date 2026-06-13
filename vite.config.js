import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Tiny Town is a static, single-page game. We keep a relative base so the
// built `dist/` can be dropped onto any host (subpath or root) and just work.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Precache the app shell *and* the sprite sheet so the game works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Tiny Town',
        short_name: 'Tiny Town',
        description: 'A cozy paper-doll sandbox: decorate rooms, dress up friends, and find hidden treasure.',
        theme_color: '#211A40',
        background_color: '#211A40',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: {
    target: 'es2018',
    assetsInlineLimit: 4096, // keep the webp sprites as separate, cacheable files
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split React into its own long-lived chunk so app updates don't bust it.
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
});
