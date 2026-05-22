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
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['motion/react'],
          'supabase': ['@supabase/supabase-js'],
          'lucide': ['lucide-react'],
          // Three.js + R3F stays out of the critical bundle — the hero canvas
          // is dynamically imported via React.lazy, so this chunk only loads
          // after first paint.
          'three': ['three', '@react-three/fiber'],
        },
      },
    },
  },
});
