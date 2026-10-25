import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {PRODUCT} from './src/config';

// base relativa: a pasta dist funciona em qualquer domínio ou subpasta.
// %PRICE% no index.html vem de src/config.ts (fonte única do preço).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'product-placeholders',
      transformIndexHtml: (html) => html.replaceAll('%PRICE%', PRODUCT.price),
    },
  ],
  server: {host: '127.0.0.1', port: 5173},
  preview: {host: '127.0.0.1', port: 4173},
});
