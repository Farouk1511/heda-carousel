import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { bumpRenderPlugin } from './vite-bump-render';
import { linksApiPlugin } from './vite-links-api';

export default defineConfig(({ mode }) => {
  // Empty prefix: these are read for the Node-side dev API only. Without the
  // `VITE_` prefix Vite will not inline them into the client bundle, which is
  // exactly what keeps the service-role key out of the browser.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      bumpRenderPlugin(),
      linksApiPlugin({
        supabaseUrl: env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
        siteUrl: env.LINKS_SITE_URL || env.NEXT_PUBLIC_SITE_URL,
      }),
    ],
    server: {
      port: 3000,
    },
  };
});
