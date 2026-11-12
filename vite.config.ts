import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor';
          if (/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
          // The client module goes with supabase-js. Left to itself the bundler
          // folded src/lib/supabase.ts into the main bundle, which made every
          // first page load wait for the whole library even though the
          // homepage only loads it afterwards (src/lib/db.ts).
          if (/node_modules\/@supabase\//.test(id) || /src\/lib\/supabase\.ts$/.test(id) || /shared\/supabasePublic\.ts$/.test(id)) return 'supabase';
          if (/node_modules\/lucide-react\//.test(id)) return 'lucide';
          if (/node_modules\/@stripe\//.test(id)) return 'stripe-client';
        },
      },
    },
  },
});
