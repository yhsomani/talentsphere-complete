import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { reticle } from '@reticlehq/vite-plugin';
export default defineConfig({
  plugins: [reticle(), react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
});
