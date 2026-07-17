import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { bumpRenderPlugin } from './vite-bump-render';

export default defineConfig({
  plugins: [react(), bumpRenderPlugin()],
  server: {
    port: 3000,
  },
});
