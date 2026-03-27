import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' &&
      visualizer({
        open: true,
        filename: 'dist/bundle-analysis.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

          if (!normalizedId.includes('/node_modules/')) {
            return;
          }

          if (normalizedId.includes('/node_modules/xlsx/')) {
            return 'spreadsheet';
          }

          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/react-router-dom/')
          ) {
            return 'react-vendor';
          }

          if (normalizedId.includes('/node_modules/lucide-react/')) {
            return 'icons';
          }
        },
      },
    },
  },
}));
