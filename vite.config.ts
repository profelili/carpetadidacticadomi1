import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    base: './', // Using relative path for full offline/portable compatibility
    plugins: [react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      assetsInlineLimit: 100000000, // 100MB - inlines all images/assets as Base64 in index.html
      chunkSizeWarningLimit: 100000000,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Use process env for HMR configuration
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
