import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { reticle } from '@reticlehq/vite-plugin';
export default defineConfig({
  plugins: [reticle(), react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    // Browser code talks to the API through same-origin /api/*; without this
    // proxy every UI transaction would fail and fake fallbacks would creep back.
    proxy: {
      '/api': 'http://127.0.0.1:4000',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://127.0.0.1:4000',
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
});
