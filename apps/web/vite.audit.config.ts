import { mergeConfig } from 'vite';
import base from './vite.config';

// Throwaway config for the E2E audit: same app, isolated API on :4100.
export default mergeConfig(base, {
  server: { port: 5199, strictPort: true, proxy: { '/api': 'http://127.0.0.1:4100' } },
});
