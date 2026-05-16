import { defineConfig } from 'vite';
import { resolve } from 'path';
import gzip from 'rollup-plugin-gzip';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  base: './',
  // Inject data.js before the main module script in head
  transformIndexHtml(html) {
    return html.replace(
      '<script type="module" crossorigin src="./assets/',
      '<script src="./data.js"></script>\n  <script type="module" crossorigin src="./assets/'
    );
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
    plugins: [
      gzip({
        include: /\.(js|css|html|json|svg)$/,
        additionalFiles: [],
      }),
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
});
